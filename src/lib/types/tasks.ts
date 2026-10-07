export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  priority: number;
  status: TaskStatus;
  created_at: string;
};

export type TaskFilters = {
  q: string;
  status: TaskStatus | "all";
  priority: number | "all";
};

export type TaskFormValues = {
  title: string;
  notes: string;
  dueDate: string;
  priority: number;
  status: TaskStatus;
};

export type TaskActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export type TasksSearchParams = {
  q?: string;
  status?: string;
  priority?: string;
};
