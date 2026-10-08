"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toggleComplete, updateTaskStatus } from "@/app/tasks/actions";
import { TaskStatusSelect } from "@/app/tasks/_components/task-status-select";
import { TasksSurface } from "@/app/tasks/_components/tasks-surface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TASKS_TABLE, TASK_TOASTS } from "@/lib/constants/tasks";
import {
  formatDueDate,
  isPastDue,
  priorityBadgeClass,
} from "@/lib/tasks/queries";
import type { Task, TaskStatus } from "@/lib/types/tasks";
import { cn } from "@/lib/utils";

type TasksTableProps = {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export function TasksTable({ tasks, onEdit, onDelete }: TasksTableProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  async function handleToggle(task: Task) {
    setTogglingId(task.id);
    const result = await toggleComplete(task.id);
    setTogglingId(null);

    if (result.ok) {
      toast.success(
        task.status === "done"
          ? TASK_TOASTS.markedTodo
          : TASK_TOASTS.completed,
      );
    } else {
      toast.error(result.message);
    }
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    if (status === task.status) {
      return;
    }

    setStatusUpdatingId(task.id);
    const result = await updateTaskStatus(task.id, status);
    setStatusUpdatingId(null);

    if (result.ok) {
      toast.success(TASK_TOASTS.statusUpdated);
    } else {
      toast.error(result.message);
    }
  }

  const busy = (task: Task) =>
    togglingId === task.id || statusUpdatingId === task.id;

  return (
    <>
      <TasksSurface className="hidden lg:block">
        <Table className="table-fixed min-w-176">
          <TableHeader>
            <TableRow className="border-border/80 hover:bg-transparent">
              <TableHead className="w-12 bg-muted/40 px-4" />
              <TableHead className="bg-muted/40 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {TASKS_TABLE.title}
              </TableHead>
              <TableHead className="w-36 bg-muted/40 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {TASKS_TABLE.dueDate}
              </TableHead>
              <TableHead className="w-28 bg-muted/40 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {TASKS_TABLE.priority}
              </TableHead>
              <TableHead className="w-32 bg-muted/40 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {TASKS_TABLE.status}
              </TableHead>
              <TableHead className="w-28 bg-muted/40 px-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {TASKS_TABLE.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const isDone = task.status === "done";
              const pastDue = isPastDue(task.due_date, task.status);
              return (
                <TableRow
                  key={task.id}
                  className="group border-border/60 transition-colors hover:bg-muted/25"
                >
                  <TableCell className="px-4 py-3">
                    <CompleteCheckbox
                      task={task}
                      disabled={busy(task)}
                      onToggle={handleToggle}
                    />
                  </TableCell>
                  <TableCell className="min-w-0 overflow-hidden whitespace-normal px-4 py-3">
                    <TaskCopy task={task} isDone={isDone} />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <DueDate task={task} isDone={isDone} pastDue={pastDue} />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <TaskStatusSelect
                      taskTitle={task.title}
                      value={task.status}
                      disabled={busy(task)}
                      onValueChange={(status) =>
                        handleStatusChange(task, status)
                      }
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <RowActions
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TasksSurface>

      <TasksSurface className="divide-y divide-border lg:hidden">
        {tasks.map((task) => {
          const isDone = task.status === "done";
          const pastDue = isPastDue(task.due_date, task.status);
          return (
            <div key={task.id} className="flex gap-3 p-3.5">
              <div className="pt-0.5">
                <CompleteCheckbox
                  task={task}
                  disabled={busy(task)}
                  onToggle={handleToggle}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <TaskCopy task={task} isDone={isDone} />
                  </div>
                  <RowActions
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <DueDate task={task} isDone={isDone} pastDue={pastDue} />
                  <PriorityBadge priority={task.priority} />
                  <div className="min-w-0 max-w-full">
                    <TaskStatusSelect
                      taskTitle={task.title}
                      value={task.status}
                      disabled={busy(task)}
                      onValueChange={(status) =>
                        handleStatusChange(task, status)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </TasksSurface>
    </>
  );
}

function CompleteCheckbox({
  task,
  disabled,
  onToggle,
}: {
  task: Task;
  disabled: boolean;
  onToggle: (task: Task) => void;
}) {
  const isDone = task.status === "done";
  return (
    <input
      type="checkbox"
      className="size-4 cursor-pointer rounded border-input accent-primary transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      checked={isDone}
      disabled={disabled}
      onChange={() => onToggle(task)}
      aria-label={
        isDone
          ? `Mark "${task.title}" as to do`
          : `Complete "${task.title}"`
      }
    />
  );
}

function TaskCopy({ task, isDone }: { task: Task; isDone: boolean }) {
  return (
    <>
      <p
        className={cn(
          "wrap-break-word font-medium leading-snug",
          isDone && "text-muted-foreground line-through",
        )}
      >
        {task.title}
      </p>
      {task.notes ? (
        <p
          className={cn(
            "mt-1 line-clamp-2 wrap-break-word text-xs leading-relaxed text-muted-foreground",
            isDone && "line-through",
          )}
        >
          {task.notes}
        </p>
      ) : null}
    </>
  );
}

function DueDate({
  task,
  isDone,
  pastDue,
}: {
  task: Task;
  isDone: boolean;
  pastDue: boolean;
}) {
  return (
    <span
      className={cn(
        "text-sm",
        isDone && "text-muted-foreground line-through opacity-70",
        !isDone && pastDue && "font-medium text-destructive",
        !isDone && !pastDue && "text-muted-foreground",
      )}
      title={pastDue ? TASKS_TABLE.overdue : undefined}
    >
      {formatDueDate(task.due_date)}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  return (
    <Badge
      className={cn(
        "min-w-7 justify-center border-0 font-semibold shadow-none",
        priorityBadgeClass(priority),
      )}
    >
      {priority}
    </Badge>
  );
}

function RowActions({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <div className="flex shrink-0 justify-end gap-0.5 opacity-100 sm:opacity-80 sm:group-hover:opacity-100">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:bg-accent hover:text-foreground"
        onClick={() => onEdit(task)}
        aria-label={`Edit ${task.title}`}
      >
        <PencilIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onDelete(task)}
        aria-label={`Delete ${task.title}`}
      >
        <Trash2Icon className="size-4" />
      </Button>
    </div>
  );
}
