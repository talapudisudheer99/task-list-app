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
  dropZoneIdle: "Drag and drop a CSV file here, or choose one below",
  dropZoneActive: "Drop your CSV file to upload",
  dropZoneSelected: (name: string) => `Selected: ${name}`,
  import: "Import",
  importing: "Importing…",
  close: "Close",
  downloadRejected: "Download rejected rows",
  rejectedFileName: "rejected-rows.csv",
  blankRowsSkipped: (count: number) =>
    count === 1 ? "1 blank row skipped" : `${count} blank rows skipped`,
  summary: (imported: number, rejected: number, blank: number) =>
    `${imported} imported · ${rejected} rejected · ${IMPORT_UI.blankRowsSkipped(blank)}`,
  resultTitleSuccess: "Import complete",
  resultTitlePartial: "Import finished with some issues",
  resultTitleNone: "No tasks were imported",
  resultSuccessHint: "New tasks are now in your list.",
  resultPartialHint:
    "Valid rows were added. Review the rejected rows below, fix your file, and import again if needed.",
  resultNoneHint:
    "Every row was skipped or invalid. Check the reasons below and update your CSV.",
  statImported: "Imported",
  statRejected: "Rejected",
  statBlankSkipped: "Blank skipped",
  rejectedSectionTitle: "Rows not imported",
  tableRow: "Row",
  tableTitle: "Title",
  tableReason: "Reason",
  invalidFileType: "Please upload a .csv file.",
  fileTooLarge: `File must be ${IMPORT_LIMITS.maxBytesLabel} or smaller.`,
  notSignedIn: "You must be signed in to import tasks.",
  importFailed: "Import failed. Please try again.",
  rpcNotDeployed:
    "CSV import is not set up on the database yet. In Supabase → SQL Editor, run the script supabase/migrations/002_import_tasks_function.sql, then try again.",
} as const;
