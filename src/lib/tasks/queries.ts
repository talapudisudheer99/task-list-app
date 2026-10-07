import type { SupabaseClient } from "@supabase/supabase-js";
import { escapeIlikePattern } from "./search";
import { TASK_STATUS_LABELS, TASKS_TABLE } from "@/lib/constants/tasks";
import type { Task, TaskFilters, TaskStatus } from "@/lib/types/tasks";

const TASK_COLUMNS =
  "id, title, notes, due_date, priority, status, created_at";

export function parseTaskFilters(params: {
  q?: string;
  status?: string;
  priority?: string;
}): TaskFilters {
  const q = params.q?.trim() ?? "";

  let status: TaskFilters["status"] = "all";
  if (
    params.status === "todo" ||
    params.status === "in_progress" ||
    params.status === "done"
  ) {
    status = params.status;
  }

  let priority: TaskFilters["priority"] = "all";
  if (params.priority && params.priority !== "all") {
    const n = Number(params.priority);
    if (Number.isInteger(n) && n >= 1 && n <= 5) {
      priority = n;
    }
  }

  return { q, status, priority };
}

export function filtersAreActive(filters: TaskFilters): boolean {
  return (
    filters.q.length > 0 ||
    filters.status !== "all" ||
    filters.priority !== "all"
  );
}

export async function fetchTasks(
  supabase: SupabaseClient,
  filters: TaskFilters,
): Promise<{ tasks: Task[]; error: Error | null }> {
  let query = supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .is("deleted_at", null)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  const pattern = escapeIlikePattern(filters.q);
  if (pattern) {
    const like = `%${pattern}%`;
    query = query.or(`title.ilike."${like}",notes.ilike."${like}"`);
  }

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }

  const { data, error } = await query;

  if (error) {
    return { tasks: [], error: new Error(error.message) };
  }

  return { tasks: (data ?? []) as Task[], error: null };
}

export async function countActiveTasks(
  supabase: SupabaseClient,
): Promise<number> {
  const { count, error } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  if (error) {
    return 0;
  }
  return count ?? 0;
}

export function statusLabel(status: TaskStatus): string {
  return TASK_STATUS_LABELS[status];
}

export function formatDueDate(isoDate: string | null): string {
  if (!isoDate) {
    return TASKS_TABLE.noDueDate;
  }
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function priorityBadgeClass(priority: number): string {
  const map: Record<number, string> = {
    1: "bg-priority-1 text-primary-foreground",
    2: "bg-priority-2 text-primary-foreground",
    3: "bg-priority-3 text-foreground",
    4: "bg-priority-4 text-primary-foreground",
    5: "bg-priority-5 text-primary-foreground",
  };
  return map[priority] ?? "bg-muted text-muted-foreground";
}

export function statusBadgeClass(status: TaskStatus): string {
  switch (status) {
    case "todo":
      return "bg-muted text-muted-foreground";
    case "in_progress":
      return "bg-status-progress/15 text-status-progress";
    case "done":
      return "bg-status-done/15 text-status-done";
  }
}
