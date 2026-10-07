"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusBadgeClass, statusLabel } from "@/lib/tasks/queries";
import type { TaskStatus } from "@/lib/types/tasks";
import { cn } from "@/lib/utils";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

type TaskStatusSelectProps = {
  taskTitle: string;
  value: TaskStatus;
  disabled?: boolean;
  onValueChange: (status: TaskStatus) => void;
};

export function TaskStatusSelect({
  taskTitle,
  value,
  disabled,
  onValueChange,
}: TaskStatusSelectProps) {
  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (next) {
          onValueChange(next as TaskStatus);
        }
      }}
    >
      <SelectTrigger
        aria-label={`Change status for ${taskTitle}`}
        className={cn(
          "h-8 w-full min-w-[7.25rem] border-0 px-2.5 text-xs font-medium shadow-none",
          "data-[size=default]:h-8",
          statusBadgeClass(value),
        )}
      >
        <SelectValue>{statusLabel(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {statusLabel(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
