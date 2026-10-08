"use client";

import { useState } from "react";
import { toast } from "sonner";
import { softDeleteTask } from "@/app/tasks/actions";
import { toastCountedSuccess } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DELETE_TASK, TASK_TOASTS } from "@/lib/constants/tasks";
import type { Task } from "@/lib/types/tasks";

type DeleteTaskDialogProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTaskDialog({
  task,
  open,
  onOpenChange,
}: DeleteTaskDialogProps) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!task) {
      return;
    }
    setPending(true);
    const result = await softDeleteTask(task.id);
    setPending(false);

    if (result.ok) {
      toastCountedSuccess("task-deleted", TASK_TOASTS.deletedMany);
      onOpenChange(false);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{DELETE_TASK.title}</DialogTitle>
          <DialogDescription>{DELETE_TASK.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {DELETE_TASK.cancel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? DELETE_TASK.deleting : DELETE_TASK.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
