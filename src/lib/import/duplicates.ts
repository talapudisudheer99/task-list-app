import { CSV_DUPLICATE_IN_FILE } from "@/lib/constants/import";
import type { RejectedCsvRow, ValidCsvRow } from "@/lib/types/import";

export type DuplicateInFileResult = {
  unique: ValidCsvRow[];
  rejected: RejectedCsvRow[];
};

function duplicateKey(title: string, dueDate: string): string {
  return `${title.trim().toLowerCase()}|${dueDate}`;
}

/** First row with a given title + due_date wins; later rows are rejected. */
export function findDuplicatesInFile(
  validRows: ValidCsvRow[],
): DuplicateInFileResult {
  const seen = new Map<string, number>();
  const unique: ValidCsvRow[] = [];
  const rejected: RejectedCsvRow[] = [];

  for (const row of validRows) {
    const key = duplicateKey(row.title, row.due_date);
    const firstRow = seen.get(key);

    if (firstRow !== undefined) {
      rejected.push({
        row_number: row.rowNumber,
        reason: CSV_DUPLICATE_IN_FILE(firstRow),
        title: row.title,
        due_date: row.due_date,
        priority: String(row.priority),
        notes: row.notes,
      });
      continue;
    }

    seen.set(key, row.rowNumber);
    unique.push(row);
  }

  return { unique, rejected };
}
