"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASKS_TOOLBAR } from "@/lib/constants/tasks";
import { statusLabel } from "@/lib/tasks/queries";
import type { TaskFilters, TaskStatus } from "@/lib/types/tasks";

type TasksToolbarProps = {
  filters: TaskFilters;
  onNewTask: () => void;
  onImportCsv: () => void;
};

export function TasksToolbar({
  filters,
  onNewTask,
  onImportCsv,
}: TasksToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(filters.q);

  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === filters.q) {
      return;
    }

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      const qs = params.toString();
      router.replace(qs ? `/tasks?${qs}` : "/tasks");
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, filters.q, router, searchParams]);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const qs = params.toString();
    router.replace(qs ? `/tasks?${qs}` : "/tasks");
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <div className="relative w-full min-w-0 max-w-md lg:flex-1">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder={TASKS_TOOLBAR.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-full pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.status}
          onValueChange={(value) => {
            if (value) {
              updateParam("status", value);
            }
          }}
        >
          <SelectTrigger className="w-[140px]">
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
          <SelectTrigger className="w-[140px]">
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

        <Button type="button" variant="outline" onClick={onImportCsv}>
          {TASKS_TOOLBAR.importCsv}
        </Button>

        <Button type="button" onClick={onNewTask}>
          <PlusIcon data-icon="inline-start" />
          {TASKS_TOOLBAR.newTask}
        </Button>
      </div>
    </div>
  );
}
