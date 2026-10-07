import { describe, expect, it } from "vitest";
import { CSV_DUPLICATE_IN_FILE } from "@/lib/constants/import";
import type { ValidCsvRow } from "@/lib/types/import";
import { findDuplicatesInFile } from "./duplicates";

function validRow(
  overrides: Partial<ValidCsvRow> & { rowNumber: number },
): ValidCsvRow {
  return {
    title: "Buy milk",
    due_date: "2026-10-01",
    priority: 3,
    notes: "",
    ...overrides,
  };
}

describe("findDuplicatesInFile", () => {
  it("rejects a later duplicate with case-insensitive trimmed title match", () => {
    const rows = [
      validRow({ rowNumber: 2, title: "Buy milk", due_date: "2026-10-01" }),
      validRow({
        rowNumber: 5,
        title: "  buy MILK ",
        due_date: "2026-10-01",
      }),
    ];

    const { unique, rejected } = findDuplicatesInFile(rows);

    expect(unique).toHaveLength(1);
    expect(unique[0].rowNumber).toBe(2);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]).toMatchObject({
      row_number: 5,
      reason: CSV_DUPLICATE_IN_FILE(2),
    });
  });

  it("does not treat same title with a different due date as a duplicate", () => {
    const rows = [
      validRow({ rowNumber: 2, title: "Pay rent", due_date: "2026-10-01" }),
      validRow({ rowNumber: 3, title: "Pay rent", due_date: "2026-11-01" }),
    ];

    const { unique, rejected } = findDuplicatesInFile(rows);

    expect(unique).toHaveLength(2);
    expect(rejected).toHaveLength(0);
  });
});
