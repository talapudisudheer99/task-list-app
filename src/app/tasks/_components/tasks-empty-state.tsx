"use client";

import { ClipboardListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TASKS_EMPTY } from "@/lib/constants/tasks";

type TasksEmptyStateProps = {
  variant: "no-tasks" | "no-matches";
  onNewTask?: () => void;
  onClearFilters?: () => void;
};

export function TasksEmptyState({
  variant,
  onNewTask,
  onClearFilters,
}: TasksEmptyStateProps) {
  if (variant === "no-matches") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <ClipboardListIcon className="size-12 text-muted-foreground" />
        <p className="font-medium">{TASKS_EMPTY.noMatchesTitle}</p>
        <Button type="button" variant="outline" onClick={onClearFilters}>
          {TASKS_EMPTY.clearFilters}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <ClipboardListIcon className="size-12 text-muted-foreground" />
      <p className="font-medium">{TASKS_EMPTY.noTasksTitle}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {TASKS_EMPTY.noTasksDescription}
      </p>
      <Button type="button" onClick={onNewTask}>
        {TASKS_EMPTY.newTaskButton}
      </Button>
    </div>
  );
}
