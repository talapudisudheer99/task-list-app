"use client";

import { ClipboardListIcon, SearchXIcon } from "lucide-react";
import { TasksSurface } from "@/app/tasks/_components/tasks-surface";
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
  const isNoMatches = variant === "no-matches";
  const Icon = isNoMatches ? SearchXIcon : ClipboardListIcon;

  return (
    <TasksSurface className="border-dashed bg-muted/20">
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-7" aria-hidden />
        </div>
        <div className="max-w-sm space-y-1">
          <p className="font-heading text-lg font-semibold tracking-tight">
            {isNoMatches
              ? TASKS_EMPTY.noMatchesTitle
              : TASKS_EMPTY.noTasksTitle}
          </p>
          {!isNoMatches ? (
            <p className="text-sm text-muted-foreground">
              {TASKS_EMPTY.noTasksDescription}
            </p>
          ) : null}
        </div>
        {isNoMatches ? (
          <Button type="button" variant="outline" onClick={onClearFilters}>
            {TASKS_EMPTY.clearFilters}
          </Button>
        ) : (
          <Button type="button" onClick={onNewTask}>
            {TASKS_EMPTY.newTaskButton}
          </Button>
        )}
      </div>
    </TasksSurface>
  );
}
