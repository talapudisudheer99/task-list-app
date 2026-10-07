"use server";

import { revalidatePath } from "next/cache";
import {
  CSV_DUPLICATE_IN_ACCOUNT,
  IMPORT_LIMITS,
  IMPORT_UI,
} from "@/lib/constants/import";
import { findDuplicatesInFile } from "@/lib/import/duplicates";
import { isCsvFile } from "@/lib/import/is-csv-file";
import { parseCsv } from "@/lib/import/parse-csv";
import { validateCsvRow } from "@/lib/import/validate-row";
import { createClient } from "@/lib/supabase/server";
import type {
  CsvRawRow,
  ImportTasksResult,
  RejectedCsvRow,
  ValidCsvRow,
} from "@/lib/types/import";

function emptyResult(error: string): ImportTasksResult {
  return { imported: 0, rejected: [], blankRows: 0, error };
}

function toRejected(row: CsvRawRow, reason: string): RejectedCsvRow {
  return {
    row_number: row.rowNumber,
    reason,
    title: row.title,
    due_date: row.due_date,
    priority: row.priority,
    notes: row.notes,
  };
}

function toRejectedFromValid(row: ValidCsvRow, reason: string): RejectedCsvRow {
  return {
    row_number: row.rowNumber,
    reason,
    title: row.title,
    due_date: row.due_date,
    priority: String(row.priority),
    notes: row.notes,
  };
}

/** Turn PostgREST errors into messages a human can act on. */
function mapRpcError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("import_tasks") &&
    (lower.includes("schema cache") || lower.includes("could not find"))
  ) {
    return IMPORT_UI.rpcNotDeployed;
  }
  return message;
}

export async function importTasks(
  formData: FormData,
): Promise<ImportTasksResult> {
  try {
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    if (!claims?.claims) {
      return emptyResult(IMPORT_UI.notSignedIn);
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return emptyResult(IMPORT_UI.invalidFileType);
    }

    if (!isCsvFile(file)) {
      return emptyResult(IMPORT_UI.invalidFileType);
    }

    if (file.size > IMPORT_LIMITS.maxBytes) {
      return emptyResult(IMPORT_UI.fileTooLarge);
    }

    const text = await file.text();
    const parsed = parseCsv(text);

    if (parsed.error) {
      return emptyResult(parsed.error);
    }

    const rejected: RejectedCsvRow[] = [];
    const valid: ValidCsvRow[] = [];

    for (const row of parsed.rows) {
      const result = validateCsvRow(row);
      if (!result.ok) {
        rejected.push(toRejected(row, result.reason));
      } else {
        valid.push(result.value);
      }
    }

    const { unique, rejected: dupInFile } = findDuplicatesInFile(valid);
    rejected.push(...dupInFile);

    let imported = 0;

    if (unique.length > 0) {
      const p_rows = unique.map((row) => ({
        row_number: row.rowNumber,
        title: row.title,
        due_date: row.due_date,
        priority: row.priority,
        notes: row.notes ?? "",
      }));

      const { data, error } = await supabase.rpc("import_tasks", {
        p_rows,
      });

      if (error) {
        return {
          imported: 0,
          rejected: sortRejected(rejected),
          blankRows: parsed.blankRows,
          error: mapRpcError(error.message || IMPORT_UI.importFailed),
        };
      }

      const payload = data as {
        inserted?: number;
        duplicates?: { row_number: number; reason?: string }[];
      };

      imported = payload.inserted ?? 0;

      const byRow = new Map(unique.map((row) => [row.rowNumber, row]));
      for (const dup of payload.duplicates ?? []) {
        const source = byRow.get(dup.row_number);
        if (source) {
          rejected.push(
            toRejectedFromValid(
              source,
              dup.reason ?? CSV_DUPLICATE_IN_ACCOUNT,
            ),
          );
        } else {
          rejected.push({
            row_number: dup.row_number,
            reason: dup.reason ?? CSV_DUPLICATE_IN_ACCOUNT,
            title: "",
            due_date: "",
            priority: "",
            notes: "",
          });
        }
      }
    }

    revalidatePath("/tasks");

    return {
      imported,
      rejected: sortRejected(rejected),
      blankRows: parsed.blankRows,
      error: null,
    };
  } catch {
    return emptyResult(IMPORT_UI.importFailed);
  }
}

function sortRejected(rows: RejectedCsvRow[]): RejectedCsvRow[] {
  return [...rows].sort((a, b) => a.row_number - b.row_number);
}
