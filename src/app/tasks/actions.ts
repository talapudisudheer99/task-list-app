"use server";

import { revalidatePath } from "next/cache";
import { TASK_ACTION_ERRORS } from "@/lib/constants/tasks";
import { createClient } from "@/lib/supabase/server";
import type { TaskActionResult, TaskFormValues, TaskStatus } from "@/lib/types/tasks";
import { validateTaskInput } from "@/lib/tasks/validation";

export type { TaskActionResult };

function mapDbError(error: { code?: string; message: string }): string {
  if (error.code === "23505") {
    return TASK_ACTION_ERRORS.duplicate;
  }
  return error.message;
}

export async function createTask(
  values: Omit<TaskFormValues, "status">,
): Promise<TaskActionResult> {
  const parsed = validateTaskInput({
    title: values.title,
    notes: values.notes,
    dueDate: values.dueDate,
    priority: values.priority,
  });

  if (!parsed.ok) {
    return {
      ok: false,
      message: TASK_ACTION_ERRORS.fixFields,
      fieldErrors: parsed.errors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    title: parsed.value.title,
    notes: parsed.value.notes,
    due_date: parsed.value.dueDate,
    priority: parsed.value.priority,
    status: "todo",
  });

  if (error) {
    return { ok: false, message: mapDbError(error) };
  }

  revalidatePath("/tasks");
  return { ok: true };
}

export async function updateTask(
  id: string,
  values: TaskFormValues,
): Promise<TaskActionResult> {
  const parsed = validateTaskInput({
    title: values.title,
    notes: values.notes,
    dueDate: values.dueDate,
    priority: values.priority,
    status: values.status,
    requireStatus: true,
  });

  if (!parsed.ok) {
    return {
      ok: false,
      message: TASK_ACTION_ERRORS.fixFields,
      fieldErrors: parsed.errors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      title: parsed.value.title,
      notes: parsed.value.notes,
      due_date: parsed.value.dueDate,
      priority: parsed.value.priority,
      status: parsed.value.status,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    return { ok: false, message: mapDbError(error) };
  }

  revalidatePath("/tasks");
  return { ok: true };
}

export async function toggleComplete(id: string): Promise<TaskActionResult> {
  const supabase = await createClient();

  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("status")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (fetchError || !task) {
    return { ok: false, message: TASK_ACTION_ERRORS.notFound };
  }

  const current = task.status as TaskStatus;
  const nextStatus: TaskStatus = current === "done" ? "todo" : "done";

  const { error } = await supabase
    .from("tasks")
    .update({ status: nextStatus })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    return { ok: false, message: mapDbError(error) };
  }

  revalidatePath("/tasks");
  return { ok: true };
}

export async function softDeleteTask(id: string): Promise<TaskActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    return { ok: false, message: mapDbError(error) };
  }

  revalidatePath("/tasks");
  return { ok: true };
}
