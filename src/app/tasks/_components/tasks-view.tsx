"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Task, TaskFilters } from "@/lib/types/tasks";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { ImportCsvDialog } from "./import-csv-dialog";
import { TaskFormDialog } from "./task-form-dialog";
import { TasksEmptyState } from "./tasks-empty-state";
import { TasksTable } from "./tasks-table";
import { TasksToolbar } from "./tasks-toolbar";

type TasksViewProps = {
  tasks: Task[];
  filters: TaskFilters;
  hasFilters: boolean;
  hasAnyTasks: boolean;
};

export function TasksView({
  tasks,
  filters,
  hasFilters,
  hasAnyTasks,
}: TasksViewProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  function openCreate() {
    setFormMode("create");
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setFormMode("edit");
    setEditingTask(task);
    setFormOpen(true);
  }

  function openDelete(task: Task) {
    setDeletingTask(task);
    setDeleteOpen(true);
  }

  function clearFilters() {
    router.replace("/tasks");
  }

  const showEmpty = tasks.length === 0;

  return (
    <>
      <TasksToolbar
        key={filters.q}
        filters={filters}
        onNewTask={openCreate}
        onImportCsv={() => setImportOpen(true)}
      />

      {showEmpty ? (
        <TasksEmptyState
          variant={hasFilters || hasAnyTasks ? "no-matches" : "no-tasks"}
          onNewTask={openCreate}
          onClearFilters={clearFilters}
        />
      ) : (
        <TasksTable tasks={tasks} onEdit={openEdit} onDelete={openDelete} />
      )}

      <TaskFormDialog
        mode={formMode}
        task={editingTask}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <DeleteTaskDialog
        task={deletingTask}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />

      <ImportCsvDialog open={importOpen} onOpenChange={setImportOpen} />
    </>
  );
}
