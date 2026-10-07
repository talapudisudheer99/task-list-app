import { CSV_ROW_ERRORS } from "@/lib/constants/import";
import {
  isRealCalendarDate,
  validatePriority,
  validateTitle,
} from "@/lib/tasks/validation";
import type { CsvRawRow, ValidCsvRow } from "@/lib/types/import";

export type ValidateCsvRowResult =
  | { ok: true; value: ValidCsvRow }
  | { ok: false; reason: string };

function mapTitleError(message: string | null): string | null {
  if (!message) {
    return null;
  }
  if (message.includes("required")) {
    return CSV_ROW_ERRORS.titleRequired;
  }
  if (message.includes("200")) {
    return CSV_ROW_ERRORS.titleTooLong;
  }
  return CSV_ROW_ERRORS.titleRequired;
}

function mapPriorityError(message: string | null): string | null {
  if (!message) {
    return null;
  }
  return CSV_ROW_ERRORS.priorityInvalid;
}

/** Validate one CSV data row (due_date is required for import). */
export function validateCsvRow(row: CsvRawRow): ValidateCsvRowResult {
  const titleError = mapTitleError(validateTitle(row.title));
  if (titleError) {
    return { ok: false, reason: titleError };
  }

  const dueTrimmed = row.due_date.trim();
  if (!dueTrimmed || !isRealCalendarDate(dueTrimmed)) {
    return { ok: false, reason: CSV_ROW_ERRORS.dueDateInvalid };
  }

  const priorityError = mapPriorityError(validatePriority(row.priority));
  if (priorityError) {
    return { ok: false, reason: priorityError };
  }

  const priority =
    typeof row.priority === "number"
      ? row.priority
      : Number(row.priority.trim());

  return {
    ok: true,
    value: {
      rowNumber: row.rowNumber,
      title: row.title.trim(),
      due_date: dueTrimmed,
      priority,
      notes: row.notes,
    },
  };
}
