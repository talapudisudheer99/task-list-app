"use client";

import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { TASKS_ERROR, TASKS_PAGE } from "@/lib/constants/tasks";
import { TriangleAlertIcon } from "lucide-react";

export default function TasksError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col py-6">
      <PageContainer className="flex flex-col gap-6">
        <div>
          <h1>{TASKS_PAGE.title}</h1>
          <p className="mt-1 text-muted-foreground">{TASKS_PAGE.subtitle}</p>
        </div>

        <div
          className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <div className="flex items-start gap-2">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
            <p className="text-sm font-medium">{TASKS_ERROR.loadFailed}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            {TASKS_ERROR.tryAgain}
          </Button>
        </div>
      </PageContainer>
    </main>
  );
}
