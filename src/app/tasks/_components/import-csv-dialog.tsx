"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadIcon } from "lucide-react";
import { importTasks } from "@/app/tasks/import-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IMPORT_UI } from "@/lib/constants/import";
import { buildRejectedCsv } from "@/lib/import/rejected-csv";
import type { ImportTasksResult } from "@/lib/types/import";

type ImportCsvDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function truncateTitle(title: string, max = 48): string {
  if (title.length <= max) {
    return title || "—";
  }
  return `${title.slice(0, max - 1)}…`;
}

export function ImportCsvDialog({ open, onOpenChange }: ImportCsvDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ImportTasksResult | null>(null);

  function resetState() {
    setFile(null);
    setPending(false);
    setResult(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      resetState();
    }
    onOpenChange(next);
  }

  async function handleImport() {
    if (!file) {
      return;
    }

    setPending(true);
    const formData = new FormData();
    formData.set("file", file);

    const importResult = await importTasks(formData);
    setPending(false);
    setResult(importResult);

    if (
      importResult.error &&
      importResult.imported === 0 &&
      importResult.rejected.length === 0
    ) {
      toast.error(importResult.error);
      return;
    }

    if (importResult.error) {
      toast.error(importResult.error);
    }

    if (importResult.imported > 0) {
      router.refresh();
    }
  }

  function downloadRejected() {
    if (!result || result.rejected.length === 0) {
      return;
    }
    const csv = buildRejectedCsv(result.rejected);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = IMPORT_UI.rejectedFileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  const showResult = result !== null && !pending;
  const rejectedCount = result?.rejected.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-4 sm:max-w-lg">
        <DialogHeader className="pr-8">
          <DialogTitle>{IMPORT_UI.title}</DialogTitle>
          <DialogDescription>{IMPORT_UI.description}</DialogDescription>
        </DialogHeader>

        {!showResult ? (
          <div className="flex flex-col gap-4">
            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:bg-muted/50"
            >
              <UploadIcon className="size-8 text-muted-foreground" />
              <span className="text-sm font-medium">
                {file ? file.name : "Drag and drop or choose a CSV file"}
              </span>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                {IMPORT_UI.chooseFile}
              </Button>
            </label>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {result?.error ? (
              <p className="text-sm text-destructive" role="alert">
                {result.error}
              </p>
            ) : null}

            <p className="text-sm font-medium">
              {IMPORT_UI.summary(
                result?.imported ?? 0,
                rejectedCount,
                result?.blankRows ?? 0,
              )}
            </p>

            {rejectedCount > 0 ? (
              <div className="max-h-48 overflow-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">{IMPORT_UI.tableRow}</TableHead>
                      <TableHead>{IMPORT_UI.tableTitle}</TableHead>
                      <TableHead>{IMPORT_UI.tableReason}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result!.rejected.map((row) => (
                      <TableRow key={row.row_number}>
                        <TableCell>{row.row_number}</TableCell>
                        <TableCell className="max-w-[140px] truncate whitespace-normal">
                          {truncateTitle(row.title)}
                        </TableCell>
                        <TableCell className="whitespace-normal text-muted-foreground">
                          {row.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          {showResult && rejectedCount > 0 ? (
            <Button type="button" variant="outline" onClick={downloadRejected}>
              {IMPORT_UI.downloadRejected}
            </Button>
          ) : (
            <span />
          )}

          <div className="flex gap-2 sm:justify-end">
            {!showResult ? (
              <Button
                type="button"
                onClick={handleImport}
                disabled={!file || pending}
              >
                {pending ? IMPORT_UI.importing : IMPORT_UI.import}
              </Button>
            ) : (
              <Button type="button" onClick={() => handleOpenChange(false)}>
                {IMPORT_UI.close}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
