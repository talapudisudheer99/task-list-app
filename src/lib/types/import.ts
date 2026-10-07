/** One data row from a CSV file (spreadsheet row number included). */
export type CsvRawRow = {
  rowNumber: number;
  title: string;
  due_date: string;
  priority: string;
  notes: string;
};

export type ParseCsvSuccess = {
  rows: CsvRawRow[];
  blankRows: number;
  error: null;
};

export type ParseCsvFailure = {
  rows: [];
  blankRows: 0;
  error: string;
};

export type ParseCsvResult = ParseCsvSuccess | ParseCsvFailure;

export type ValidCsvRow = {
  rowNumber: number;
  title: string;
  due_date: string;
  priority: number;
  notes: string;
};

export type RejectedCsvRow = {
  row_number: number;
  reason: string;
  title: string;
  due_date: string;
  priority: string;
  notes: string;
};

export type ImportTasksResult = {
  imported: number;
  rejected: RejectedCsvRow[];
  blankRows: number;
  error: string | null;
};
