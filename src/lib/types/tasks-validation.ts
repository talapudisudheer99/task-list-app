import type { TaskStatus } from "@/lib/types/tasks";

export type FieldErrors = Partial<
  Record<"title" | "notes" | "dueDate" | "priority" | "status", string>
>;

export type ValidateTaskInput = {
  title: unknown;
  notes?: unknown;
  dueDate?: unknown;
  priority?: unknown;
  status?: unknown;
  /** When true (edit), status must be valid. Create defaults to todo. */
  requireStatus?: boolean;
};

export type ValidatedTaskInput = {
  title: string;
  notes: string | null;
  dueDate: string | null;
  priority: number;
  status: TaskStatus;
};
