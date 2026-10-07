import { TASK_VALIDATION_ERRORS } from "@/lib/constants/validation";
import type { TaskStatus } from "@/lib/types/tasks";
import type {
  FieldErrors,
  ValidateTaskInput,
  ValidatedTaskInput,
} from "@/lib/types/tasks-validation";

export type { FieldErrors, ValidateTaskInput, ValidatedTaskInput };

export function validateTitle(value: unknown): string | null {
  if (typeof value !== "string") {
    return TASK_VALIDATION_ERRORS.titleRequired;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return TASK_VALIDATION_ERRORS.titleRequired;
  }
  if (trimmed.length > 200) {
    return TASK_VALIDATION_ERRORS.titleMaxLength;
  }
  return null;
}

export function validatePriority(value: unknown): string | null {
  if (value === "" || value === null || value === undefined) {
    return TASK_VALIDATION_ERRORS.priorityRequired;
  }
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return TASK_VALIDATION_ERRORS.priorityRange;
  }
  return null;
}

/** Empty string is allowed (optional due date). Otherwise must be YYYY-MM-DD on a real calendar day. */
export function validateDueDate(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "string") {
    return TASK_VALIDATION_ERRORS.dueDateInvalid;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (!isRealCalendarDate(trimmed)) {
    return TASK_VALIDATION_ERRORS.dueDateFormat;
  }
  return null;
}

/** True when the string is a real calendar day in YYYY-MM-DD form. */
export function isRealCalendarDate(yyyyMmDd: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd);
  if (!match) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function validateStatus(value: unknown): string | null {
  if (value !== "todo" && value !== "in_progress" && value !== "done") {
    return TASK_VALIDATION_ERRORS.statusInvalid;
  }
  return null;
}

export function validateTaskInput(
  input: ValidateTaskInput,
):
  | { ok: true; value: ValidatedTaskInput }
  | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};

  const titleError = validateTitle(input.title);
  if (titleError) {
    errors.title = titleError;
  }

  const priorityError = validatePriority(input.priority);
  if (priorityError) {
    errors.priority = priorityError;
  }

  const dueDateError = validateDueDate(input.dueDate);
  if (dueDateError) {
    errors.dueDate = dueDateError;
  }

  let status: TaskStatus = "todo";
  if (input.requireStatus) {
    const statusError = validateStatus(input.status);
    if (statusError) {
      errors.status = statusError;
    } else {
      status = input.status as TaskStatus;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const title = String(input.title).trim();
  const notesRaw =
    input.notes === null || input.notes === undefined
      ? ""
      : String(input.notes);
  const notes = notesRaw.trim() ? notesRaw.trim() : null;

  const dueDateRaw =
    input.dueDate === null || input.dueDate === undefined
      ? ""
      : String(input.dueDate).trim();
  const dueDate = dueDateRaw ? dueDateRaw : null;

  const priority =
    typeof input.priority === "number"
      ? input.priority
      : Number(input.priority);

  return {
    ok: true,
    value: {
      title,
      notes,
      dueDate,
      priority,
      status,
    },
  };
}
