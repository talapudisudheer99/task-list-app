"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CircleCheckIcon,
  CircleMinusIcon,
  TriangleAlertIcon,
  UploadIcon,
} from "lucide-react";
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
import { isCsvFile } from "@/lib/import/is-csv-file";
import { buildRejectedCsv } from "@/lib/import/rejected-csv";
import type { ImportTasksResult } from "@/lib/types/import";
import { cn } from "@/lib/utils";

type ImportCsvDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function isFileLevelImportError(result: ImportTasksResult): boolean {
  return result.error !== null && result.rejected.length === 0;
}

function truncateTitle(title: string, max = 48): string {
  if (title.length <= max) {
    return title || "—";
  }
  return `${title.slice(0, max - 1)}…`;
}

type StatTone = "success" | "warning" | "muted";

function ImportStat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: StatTone;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border px-3 py-2.5",
        tone === "success" &&
          "border-success/30 bg-success/10 text-success",
        tone === "warning" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        tone === "muted" && "border-border bg-muted/50 text-muted-foreground",
      )}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-2xl font-semibold tabular-nums leading-none">{value}</p>
    </div>
  );
}

function ImportResultPanel({ result }: { result: ImportTasksResult }) {
  const imported = result.imported;
  const rejectedCount = result.rejected.length;
  const blankRows = result.blankRows;

  const allSuccess = imported > 0 && rejectedCount === 0;
  const partial = imported > 0 && rejectedCount > 0;
  const noneImported = imported === 0;

  const headline = allSuccess
    ? IMPORT_UI.resultTitleSuccess
    : partial
      ? IMPORT_UI.resultTitlePartial
      : IMPORT_UI.resultTitleNone;

  const hint = allSuccess
    ? IMPORT_UI.resultSuccessHint
    : partial
      ? IMPORT_UI.resultPartialHint
      : IMPORT_UI.resultNoneHint;

  const headlineIcon = allSuccess ? (
    <CircleCheckIcon className="size-5 shrink-0 text-success" />
  ) : (
    <TriangleAlertIcon
      className={cn(
        "size-5 shrink-0",
        noneImported ? "text-destructive" : "text-warning",
      )}
    />
  );

  if (isFileLevelImportError(result)) {
    return (
      <div
        className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        role="alert"
      >
        {result.error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {result.error ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {result.error}
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start gap-2">
          {headlineIcon}
          <div>
            <p className="font-semibold leading-snug">{headline}</p>
            <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <ImportStat
            label={IMPORT_UI.statImported}
            value={imported}
            tone={imported > 0 ? "success" : "muted"}
            icon={
              <CircleCheckIcon className="size-3.5 opacity-80" aria-hidden />
            }
          />
          <ImportStat
            label={IMPORT_UI.statRejected}
            value={rejectedCount}
            tone={rejectedCount > 0 ? "warning" : "muted"}
            icon={
              <TriangleAlertIcon className="size-3.5 opacity-80" aria-hidden />
            }
          />
          <ImportStat
            label={IMPORT_UI.statBlankSkipped}
            value={blankRows}
            tone="muted"
            icon={
              <CircleMinusIcon className="size-3.5 opacity-80" aria-hidden />
            }
          />
        </div>
      </div>

      {rejectedCount > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{IMPORT_UI.rejectedSectionTitle}</p>
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
                {result.rejected.map((row) => (
                  <TableRow key={row.row_number}>
                    <TableCell className="font-medium tabular-nums">
                      {row.row_number}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate">
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
        </div>
      ) : null}
    </div>
  );
}

export function ImportCsvDialog({ open, onOpenChange }: ImportCsvDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ImportTasksResult | null>(null);
  const [dragDepth, setDragDepth] = useState(0);
  const isDragging = dragDepth > 0;

  function selectCsvFile(next: File | null | undefined) {
    if (!next) {
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }
    if (!isCsvFile(next)) {
      toast.error(IMPORT_UI.invalidFileType);
      return;
    }
    setFile(next);
  }

  function resetState() {
    setFile(null);
    setPending(false);
    setResult(null);
    setDragDepth(0);
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

  const fileLevelError =
    showResult && result ? isFileLevelImportError(result) : false;

  const resultTitle =
    showResult && result && !fileLevelError
      ? result.imported > 0 && rejectedCount === 0
        ? IMPORT_UI.resultTitleSuccess
        : result.imported > 0
          ? IMPORT_UI.resultTitlePartial
          : IMPORT_UI.resultTitleNone
      : IMPORT_UI.title;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-4 sm:max-w-lg">
        <DialogHeader className="pr-8">
          <DialogTitle>{resultTitle}</DialogTitle>
          {showResult && !fileLevelError ? (
            <DialogDescription className="sr-only">
              {IMPORT_UI.summary(
                result?.imported ?? 0,
                rejectedCount,
                result?.blankRows ?? 0,
              )}
            </DialogDescription>
          ) : showResult && fileLevelError && result?.error ? (
            <DialogDescription className="sr-only">
              {result.error}
            </DialogDescription>
          ) : !showResult ? (
            <DialogDescription>{IMPORT_UI.description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {!showResult ? (
          <div className="flex flex-col gap-4">
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/30 hover:bg-muted/50",
              )}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragDepth((depth) => depth + 1);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragDepth((depth) => Math.max(0, depth - 1));
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragDepth(0);
                const dropped = e.dataTransfer.files[0];
                selectCsvFile(dropped);
              }}
            >
              <UploadIcon
                className={cn(
                  "size-8",
                  isDragging ? "text-primary" : "text-muted-foreground",
                )}
                aria-hidden
              />
              <span className="text-sm font-medium">
                {file
                  ? IMPORT_UI.dropZoneSelected(file.name)
                  : isDragging
                    ? IMPORT_UI.dropZoneActive
                    : IMPORT_UI.dropZoneIdle}
              </span>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => selectCsvFile(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                {IMPORT_UI.chooseFile}
              </Button>
            </div>
          </div>
        ) : result ? (
          <ImportResultPanel result={result} />
        ) : null}

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          {showResult && rejectedCount > 0 ? (
            <Button type="button" variant="outline" onClick={downloadRejected}>
              {IMPORT_UI.downloadRejected}
            </Button>
          ) : (
            <span className="hidden sm:block" />
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
