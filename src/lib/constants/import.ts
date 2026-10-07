export const CSV_COLUMNS = [
  "title",
  "due_date",
  "priority",
  "notes",
] as const;

export const CSV_ROW_ERRORS = {
  titleRequired: "Title is required",
  titleTooLong: "Title must be 200 characters or fewer",
  dueDateInvalid: "Due date must be a real date in YYYY-MM-DD format",
  priorityInvalid: "Priority must be a whole number from 1 to 5",
} as const;

export const CSV_FILE_ERRORS = {
  missingColumns:
    'CSV header must include columns: title, due_date, priority, notes (any order).',
  emptyFile: "The file is empty.",
  parseFailed: "Could not read this CSV file.",
} as const;

export const CSV_DUPLICATE_IN_FILE = (row: number) =>
  `Duplicate of row ${row} in this file`;

export const CSV_DUPLICATE_IN_ACCOUNT =
  "Task with this title and due date already exists";

export const IMPORT_LIMITS = {
  maxBytes: 1024 * 1024,
  maxBytesLabel: "1 MB",
} as const;

export const IMPORT_UI = {
  title: "Import tasks from CSV",
  description: "Upload a CSV with columns title, due_date, priority, notes.",
  chooseFile: "Choose file",
  import: "Import",
  importing: "Importing…",
  close: "Close",
  downloadRejected: "Download rejected rows",
  rejectedFileName: "rejected-rows.csv",
  summary: (imported: number, rejected: number, blank: number) =>
    `${imported} imported · ${rejected} rejected · ${blank} blank rows skipped`,
  tableRow: "Row",
  tableTitle: "Title",
  tableReason: "Reason",
  invalidFileType: "Please upload a .csv file.",
  fileTooLarge: `File must be ${IMPORT_LIMITS.maxBytesLabel} or smaller.`,
  notSignedIn: "You must be signed in to import tasks.",
  importFailed: "Import failed. Please try again.",
} as const;
