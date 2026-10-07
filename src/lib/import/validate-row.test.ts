import { describe, expect, it } from "vitest";
import { CSV_ROW_ERRORS } from "@/lib/constants/import";
import type { CsvRawRow } from "@/lib/types/import";
import { validateCsvRow } from "./validate-row";

function row(overrides: Partial<CsvRawRow> = {}): CsvRawRow {
  return {
    rowNumber: 2,
    title: "Valid task",
    due_date: "2026-06-15",
    priority: "3",
    notes: "",
    ...overrides,
  };
}

describe("validateCsvRow", () => {
  it("accepts a valid row", () => {
    const result = validateCsvRow(row());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("Valid task");
      expect(result.value.due_date).toBe("2026-06-15");
      expect(result.value.priority).toBe(3);
    }
  });

  it("rejects missing title", () => {
    const result = validateCsvRow(row({ title: "" }));
    expect(result).toEqual({
      ok: false,
      reason: CSV_ROW_ERRORS.titleRequired,
    });
  });

  it("rejects whitespace-only title", () => {
    const result = validateCsvRow(row({ title: "   \t  " }));
    expect(result).toEqual({
      ok: false,
      reason: CSV_ROW_ERRORS.titleRequired,
    });
  });

  it("accepts title with exactly 200 characters", () => {
    const result = validateCsvRow(row({ title: "a".repeat(200) }));
    expect(result.ok).toBe(true);
  });

  it("rejects title with 201 characters", () => {
    const result = validateCsvRow(row({ title: "a".repeat(201) }));
    expect(result).toEqual({
      ok: false,
      reason: CSV_ROW_ERRORS.titleTooLong,
    });
  });

  describe("priority", () => {
    const invalid = ["high", "3.5", "0", "6", ""];
    for (const priority of invalid) {
      it(`rejects priority "${priority}"`, () => {
        const result = validateCsvRow(row({ priority }));
        expect(result).toEqual({
          ok: false,
          reason: CSV_ROW_ERRORS.priorityInvalid,
        });
      });
    }

    it('accepts priority "1"', () => {
      const result = validateCsvRow(row({ priority: "1" }));
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.priority).toBe(1);
      }
    });

    it('accepts priority "5"', () => {
      const result = validateCsvRow(row({ priority: "5" }));
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.priority).toBe(5);
      }
    });
  });

  describe("due_date", () => {
    const invalid = ["2026-02-30", "2026-13-01", "10/10/2026", ""];
    for (const due_date of invalid) {
      it(`rejects due_date "${due_date || "(empty)"}"`, () => {
        const result = validateCsvRow(row({ due_date }));
        expect(result).toEqual({
          ok: false,
          reason: CSV_ROW_ERRORS.dueDateInvalid,
        });
      });
    }

    it("accepts leap day 2028-02-29", () => {
      const result = validateCsvRow(row({ due_date: "2028-02-29" }));
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.due_date).toBe("2028-02-29");
      }
    });
  });
});
