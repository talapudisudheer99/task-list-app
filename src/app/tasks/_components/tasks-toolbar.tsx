"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, SearchIcon, UploadIcon, XIcon } from "lucide-react";
import { TasksSurface } from "@/app/tasks/_components/tasks-surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASKS_EMPTY, TASKS_TOOLBAR } from "@/lib/constants/tasks";
import { statusLabel } from "@/lib/tasks/queries";
import type { TaskFilters, TaskStatus } from "@/lib/types/tasks";

type TasksToolbarProps = {
  filters: TaskFilters;
  hasFilters: boolean;
  onClearFilters: () => void;
  onNewTask: () => void;
  onImportCsv: () => void;
};

function buildTasksHref(filters: TaskFilters, q: string): string {
  const params = new URLSearchParams();
  const trimmed = q.trim();
  if (trimmed) {
    params.set("q", trimmed);
  }
  if (filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.priority !== "all") {
    params.set("priority", String(filters.priority));
  }
  const qs = params.toString();
  return qs ? `/tasks?${qs}` : "/tasks";
}

export function TasksToolbar({
  filters,
  hasFilters,
  onClearFilters,
  onNewTask,
  onImportCsv,
}: TasksToolbarProps) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { status, priority, q: urlQ } = filters;

  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === urlQ) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      router.replace(
        buildTasksHref({ q: urlQ, status, priority }, trimmed),
        { scroll: false },
      );
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [search, urlQ, status, priority, router]);

  function updateParam(key: "status" | "priority", value: string | null) {
    const next: TaskFilters = { ...filters };
    if (key === "status") {
      next.status =
        value === "todo" || value === "in_progress" || value === "done"
          ? value
          : "all";
    } else if (value && value !== "all") {
      const n = Number(value);
      next.priority =
        Number.isInteger(n) && n >= 1 && n <= 5 ? n : "all";
    } else {
      next.priority = "all";
    }
    router.replace(buildTasksHref(next, search), { scroll: false });
  }

  function clearSearch() {
    setSearch("");
    if (urlQ) {
      router.replace(buildTasksHref({ q: urlQ, status, priority }, ""), {
        scroll: false,
      });
    }
  }

  function handleClearAllFilters() {
    setSearch("");
    onClearFilters();
  }

  return (
    <TasksSurface padded>
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative w-full min-w-0 lg:max-w-md lg:flex-1">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="text"
            role="searchbox"
            aria-label={TASKS_TOOLBAR.searchPlaceholder}
            placeholder={TASKS_TOOLBAR.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            className="h-10 w-full border-border/80 bg-muted/30 pr-9 pl-9"
          />
          {search.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={clearSearch}
              aria-label={TASKS_TOOLBAR.clearSearch}
            >
              <XIcon className="size-4" />
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Select
            value={filters.status}
            onValueChange={(value) => {
              if (value) {
                updateParam("status", value);
              }
            }}
          >
            <SelectTrigger className="h-10 w-[148px] bg-background">
              <SelectValue>
                {TASKS_TOOLBAR.statusLabel}:{" "}
                {filters.status === "all"
                  ? TASKS_TOOLBAR.filterAll
                  : statusLabel(filters.status as TaskStatus)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{TASKS_TOOLBAR.filterAll}</SelectItem>
              <SelectItem value="todo">{statusLabel("todo")}</SelectItem>
              <SelectItem value="in_progress">
                {statusLabel("in_progress")}
              </SelectItem>
              <SelectItem value="done">{statusLabel("done")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority === "all" ? "all" : String(filters.priority)}
            onValueChange={(value) => {
              if (value) {
                updateParam("priority", value);
              }
            }}
          >
            <SelectTrigger className="h-10 w-[148px] bg-background">
              <SelectValue>
                {TASKS_TOOLBAR.priorityLabel}:{" "}
                {filters.priority === "all"
                  ? TASKS_TOOLBAR.filterAll
                  : filters.priority}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{TASKS_TOOLBAR.filterAll}</SelectItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              className="h-10 text-muted-foreground"
              onClick={handleClearAllFilters}
            >
              {TASKS_EMPTY.clearFilters}
            </Button>
          ) : null}

          <Button type="button" variant="outline" className="h-10" onClick={onImportCsv}>
            <UploadIcon data-icon="inline-start" className="size-4" />
            {TASKS_TOOLBAR.importCsv}
          </Button>

          <Button type="button" className="h-10" onClick={onNewTask}>
            <PlusIcon data-icon="inline-start" className="size-4" />
            {TASKS_TOOLBAR.newTask}
          </Button>
        </div>
      </div>
    </TasksSurface>
  );
}
