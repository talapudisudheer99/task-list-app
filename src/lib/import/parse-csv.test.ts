import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CSV_FILE_ERRORS } from "@/lib/constants/import";
import type { ValidCsvRow } from "@/lib/types/import";
import { findDuplicatesInFile } from "./duplicates";
import { parseCsv } from "./parse-csv";
import { validateCsvRow } from "./validate-row";

const samplesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../samples",
);

function runImportPipeline(text: string) {
  const parsed = parseCsv(text);
  if (parsed.error) {
    return { parsed, valid: [], rejected: [], blankRows: parsed.blankRows };
  }

  const rejected: { row_number: number; reason: string }[] = [];
  const valid: ValidCsvRow[] = [];

  for (const dataRow of parsed.rows) {
    const result = validateCsvRow(dataRow);
    if (result.ok) {
      valid.push(result.value);
    } else {
      rejected.push({
        row_number: dataRow.rowNumber,
        reason: result.reason,
      });
    }
  }

  const { unique, rejected: dupRejected } = findDuplicatesInFile(valid);
  rejected.push(...dupRejected);

  return {
    parsed,
    valid: unique,
    rejected,
    blankRows: parsed.blankRows,
  };
}

describe("parseCsv", () => {
  it("keeps a quoted field with a comma as one value", () => {
    const csv = `title,due_date,priority,notes
"Eggs, milk",2026-01-01,3,ok`;

    const result = parseCsv(csv);
    expect(result.error).toBeNull();
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].title).toBe("Eggs, milk");
    expect(result.rows[0].notes).toBe("ok");
  });

  it("handles CRLF line endings", () => {
    const csv =
      "title,due_date,priority,notes\r\n" +
      "Task A,2026-01-01,2,\r\n" +
      "Task B,2026-01-02,3,\r\n";

    const result = parseCsv(csv);
    expect(result.error).toBeNull();
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].title).toBe("Task A");
    expect(result.rows[1].title).toBe("Task B");
  });

  it("counts blank rows and does not return them as data rows", () => {
    const csv = `title,due_date,priority,notes
One,2026-01-01,1,
,,,
Two,2026-01-03,3,`;

    const result = parseCsv(csv);
    expect(result.error).toBeNull();
    expect(result.blankRows).toBe(1);
    expect(result.rows.map((r) => r.title)).toEqual(["One", "Two"]);
  });

  it("uses spreadsheet row numbers (header is row 1)", () => {
    const csv = `title,due_date,priority,notes
First,2026-01-01,1,
Second,2026-01-02,2,`;

    const result = parseCsv(csv);
    expect(result.rows[0].rowNumber).toBe(2);
    expect(result.rows[1].rowNumber).toBe(3);
  });

  it("accepts headers in any order", () => {
    const csv = `notes,priority,due_date,title
n,4,2026-05-05,Reorder`;

    const result = parseCsv(csv);
    expect(result.error).toBeNull();
    expect(result.rows[0]).toMatchObject({
      title: "Reorder",
      due_date: "2026-05-05",
      priority: "4",
      notes: "n",
    });
  });

  it("accepts uppercase headers and strips BOM", () => {
    const csv =
      "\uFEFFTITLE,DUE_DATE,PRIORITY,NOTES\n" +
      "BOM row,2026-01-01,3,";

    const result = parseCsv(csv);
    expect(result.error).toBeNull();
    expect(result.rows[0].title).toBe("BOM row");
  });

  it("returns a file-level error when a required header is missing", () => {
    const csv = `title,due_date,priority
Only three,2026-01-01,3`;

    const result = parseCsv(csv);
    expect(result.rows).toHaveLength(0);
    expect(result.error).toBe(CSV_FILE_ERRORS.missingColumns);
  });

  it("parses samples/edge-cases.csv end to end (4 valid, 5 rejected, 1 blank)", () => {
    const text = readFileSync(join(samplesDir, "edge-cases.csv"), "utf8");
    const { valid, rejected, blankRows } = runImportPipeline(text);

    expect(blankRows).toBe(1);
    expect(valid).toHaveLength(4);
    expect(rejected).toHaveLength(5);
  });
});
