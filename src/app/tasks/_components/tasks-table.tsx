"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toggleComplete } from "@/app/tasks/actions";
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
  statusBadgeClass,
  statusLabel,
} from "@/lib/tasks/queries";
import type { Task } from "@/lib/types/tasks";
import { cn } from "@/lib/utils";

type TasksTableProps = {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export function TasksTable({ tasks, onEdit, onDelete }: TasksTableProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  return (
    <TasksSurface>
      <Table className="table-fixed">
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
                  <input
                    type="checkbox"
                    className="size-4 cursor-pointer rounded border-input accent-primary transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    checked={isDone}
                    disabled={togglingId === task.id}
                    onChange={() => handleToggle(task)}
                    aria-label={
                      isDone
                        ? `Mark "${task.title}" as to do`
                        : `Complete "${task.title}"`
                    }
                  />
                </TableCell>
                <TableCell className="whitespace-normal px-4 py-3">
                  <p
                    className={cn(
                      "font-medium leading-snug",
                      isDone && "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </p>
                  {task.notes ? (
                    <p
                      className={cn(
                        "mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground",
                        isDone && "line-through",
                      )}
                    >
                      {task.notes}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell
                  className={cn(
                    "px-4 py-3",
                    isDone && "text-muted-foreground line-through opacity-70",
                    !isDone && pastDue && "font-medium text-destructive",
                    !isDone && !pastDue && "text-muted-foreground",
                  )}
                >
                  <span title={pastDue ? TASKS_TABLE.overdue : undefined}>
                    {formatDueDate(task.due_date)}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    className={cn(
                      "min-w-7 justify-center border-0 font-semibold shadow-none",
                      priorityBadgeClass(task.priority),
                    )}
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent font-medium",
                      statusBadgeClass(task.status),
                    )}
                  >
                    {statusLabel(task.status)}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-0.5 opacity-100 sm:opacity-80 sm:group-hover:opacity-100">
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TasksSurface>
  );
}
