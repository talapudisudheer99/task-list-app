import Papa from "papaparse";
import type { RejectedCsvRow } from "@/lib/types/import";

const COLUMNS = [
  "row_number",
  "reason",
  "title",
  "due_date",
  "priority",
  "notes",
] as const;

/** Build a CSV download string for rejected rows (quoted fields escaped). */
export function buildRejectedCsv(rejected: RejectedCsvRow[]): string {
  const rows = rejected.map((row) => ({
    row_number: row.row_number,
    reason: row.reason,
    title: row.title,
    due_date: row.due_date,
    priority: row.priority,
    notes: row.notes,
  }));

  return Papa.unparse(rows, {
    columns: [...COLUMNS],
    header: true,
  });
}
