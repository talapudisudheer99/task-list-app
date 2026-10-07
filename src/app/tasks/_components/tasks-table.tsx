"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toggleComplete } from "@/app/tasks/actions";
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
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>{TASKS_TABLE.title}</TableHead>
          <TableHead className="w-32">{TASKS_TABLE.dueDate}</TableHead>
          <TableHead className="w-24">{TASKS_TABLE.priority}</TableHead>
          <TableHead className="w-28">{TASKS_TABLE.status}</TableHead>
          <TableHead className="w-24 text-right">{TASKS_TABLE.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const isDone = task.status === "done";
          return (
            <TableRow key={task.id}>
              <TableCell>
                <input
                  type="checkbox"
                  className="size-4 rounded border-input accent-primary"
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
              <TableCell className="whitespace-normal">
                <p
                  className={cn(
                    "font-medium",
                    isDone && "text-muted-foreground line-through",
                  )}
                >
                  {task.title}
                </p>
                {task.notes ? (
                  <p
                    className={cn(
                      "mt-0.5 line-clamp-2 text-xs text-muted-foreground",
                      isDone && "line-through",
                    )}
                  >
                    {task.notes}
                  </p>
                ) : null}
              </TableCell>
              <TableCell
                className={cn(isDone && "text-muted-foreground line-through")}
              >
                {formatDueDate(task.due_date)}
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "min-w-6 justify-center border-transparent",
                    priorityBadgeClass(task.priority),
                  )}
                >
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "border-transparent",
                    statusBadgeClass(task.status),
                  )}
                >
                  {statusLabel(task.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(task)}
                    aria-label={`Edit ${task.title}`}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(task)}
                    aria-label={`Delete ${task.title}`}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
