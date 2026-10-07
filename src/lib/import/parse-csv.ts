import Papa from "papaparse";
import { CSV_COLUMNS, CSV_FILE_ERRORS } from "@/lib/constants/import";
import type { CsvRawRow, ParseCsvResult } from "@/lib/types/import";

const REQUIRED = [...CSV_COLUMNS];

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function isBlankRow(cells: string[]): boolean {
  return cells.every((cell) => cell.trim() === "");
}

function cellAt(row: string[], index: number): string {
  return index >= 0 && index < row.length ? row[index] : "";
}

export function parseCsv(text: string): ParseCsvResult {
  const cleaned = stripBom(text);

  const parsed = Papa.parse<string[]>(cleaned, {
    header: false,
    skipEmptyLines: false,
  });

  if (parsed.errors.length > 0) {
    return {
      rows: [],
      blankRows: 0,
      error: CSV_FILE_ERRORS.parseFailed,
    };
  }

  const data = parsed.data;
  if (data.length === 0) {
    return {
      rows: [],
      blankRows: 0,
      error: CSV_FILE_ERRORS.emptyFile,
    };
  }

  const headerRow = data[0].map((cell) => String(cell ?? "").trim().toLowerCase());
  const columnIndex: Partial<Record<(typeof REQUIRED)[number], number>> = {};

  for (const name of REQUIRED) {
    const index = headerRow.indexOf(name);
    if (index === -1) {
      return {
        rows: [],
        blankRows: 0,
        error: CSV_FILE_ERRORS.missingColumns,
      };
    }
    columnIndex[name] = index;
  }

  let dataRows = data.slice(1).map((row) =>
    row.map((cell) => (cell === null || cell === undefined ? "" : String(cell))),
  );

  // Drop a single trailing all-empty row (common when the file ends with a newline).
  if (dataRows.length > 0 && isBlankRow(dataRows[dataRows.length - 1])) {
    dataRows = dataRows.slice(0, -1);
  }

  const rows: CsvRawRow[] = [];
  let blankRows = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const cells = dataRows[i];
    const rowNumber = i + 2; // header is row 1

    if (isBlankRow(cells)) {
      blankRows += 1;
      continue;
    }

    rows.push({
      rowNumber,
      title: cellAt(cells, columnIndex.title!),
      due_date: cellAt(cells, columnIndex.due_date!),
      priority: cellAt(cells, columnIndex.priority!),
      notes: cellAt(cells, columnIndex.notes!),
    });
  }

  return { rows, blankRows, error: null };
}
