"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createTask, updateTask } from "@/app/tasks/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  TASK_FORM,
  TASK_PRIORITY_OPTIONS,
  TASK_TOASTS,
} from "@/lib/constants/tasks";
import { statusLabel } from "@/lib/tasks/queries";
import { validateTaskInput } from "@/lib/tasks/validation";
import type { Task, TaskFormValues, TaskStatus } from "@/lib/types/tasks";
import type { FieldErrors } from "@/lib/types/tasks-validation";
import { cn } from "@/lib/utils";

const FORM_ID = "task-form";

const FIELD_HEIGHT_CLASS = "h-10 min-h-10 w-full py-0";

/** Native date pickers add extra internal padding in WebKit. */
const DATE_INPUT_CLASS = cn(
  FIELD_HEIGHT_CLASS,
  "max-h-10 overflow-hidden text-sm leading-10",
  "[&::-webkit-datetime-edit]:p-0 [&::-webkit-datetime-edit]:leading-10",
  "[&::-webkit-datetime-edit-fields-wrapper]:p-0",
  "[&::-webkit-calendar-picker-indicator]:ml-0 [&::-webkit-calendar-picker-indicator]:size-4 [&::-webkit-calendar-picker-indicator]:opacity-60",
);

const SELECT_TRIGGER_CLASS = cn(
  FIELD_HEIGHT_CLASS,
  "text-sm leading-10 data-[size=default]:h-10",
);

type TaskFormDialogProps = {
  mode: "create" | "edit";
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function initialValues(mode: "create" | "edit", task: Task | null): TaskFormValues {
  if (mode === "edit" && task) {
    return {
      title: task.title,
      notes: task.notes ?? "",
      dueDate: task.due_date ?? "",
      priority: task.priority,
      status: task.status,
    };
  }
  return {
    title: "",
    notes: "",
    dueDate: "",
    priority: 3,
    status: "todo",
  };
}

function TaskFormBody({
  mode,
  task,
  onOpenChange,
}: {
  mode: "create" | "edit";
  task: Task | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [values, setValues] = useState<TaskFormValues>(() =>
    initialValues(mode, task),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  function setField<K extends keyof TaskFormValues>(
    key: K,
    value: TaskFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFieldErrors({});

    const parsed = validateTaskInput({
      title: values.title,
      notes: values.notes,
      dueDate: values.dueDate,
      priority: values.priority,
      status: values.status,
      requireStatus: true,
    });

    if (!parsed.ok) {
      setFieldErrors(parsed.errors);
      return;
    }

    setPending(true);

    const result =
      mode === "create"
        ? await createTask(values)
        : await updateTask(task!.id, values);

    setPending(false);

    if (result.ok) {
      toast.success(
        mode === "create" ? TASK_TOASTS.created : TASK_TOASTS.updated,
      );
      onOpenChange(false);
      return;
    }

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors as FieldErrors);
      return;
    }
    toast.error(result.message);
  }

  const dialogTitle =
    mode === "create" ? TASK_FORM.newTitle : TASK_FORM.editTitle;

  return (
    <>
      <DialogHeader className="pr-8">
        <DialogTitle>{dialogTitle}</DialogTitle>
      </DialogHeader>

      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="task-title">{TASK_FORM.titleLabel}</Label>
          <Input
            id="task-title"
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder={TASK_FORM.titlePlaceholder}
            aria-invalid={Boolean(fieldErrors.title)}
            className="h-10"
          />
          {fieldErrors.title ? (
            <p className="text-xs text-destructive">{fieldErrors.title}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="task-notes">{TASK_FORM.notesLabel}</Label>
          <Textarea
            id="task-notes"
            value={values.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder={TASK_FORM.notesPlaceholder}
            rows={3}
            className="min-h-20"
          />
        </div>

        <div className="flex flex-col gap-3">
          <p
            id="task-scheduling-hint"
            className="text-xs leading-relaxed text-muted-foreground"
          >
            {TASK_FORM.schedulingHint}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="task-due">
                {TASK_FORM.dueDateLabel}{" "}
                <span className="font-normal text-muted-foreground">
                  ({TASK_FORM.dueDateOptional})
                </span>
              </Label>
              <Input
                id="task-due"
                type="date"
                value={values.dueDate}
                onChange={(e) => setField("dueDate", e.target.value)}
                aria-invalid={Boolean(fieldErrors.dueDate)}
                aria-describedby="task-scheduling-hint"
                className={DATE_INPUT_CLASS}
              />
              {fieldErrors.dueDate ? (
                <p className="text-xs text-destructive">{fieldErrors.dueDate}</p>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="task-priority">{TASK_FORM.priorityLabel}</Label>
              <Select
              value={String(values.priority)}
              onValueChange={(v) => {
                if (v) {
                  setField("priority", Number(v));
                }
              }}
            >
              <SelectTrigger id="task-priority" className={SELECT_TRIGGER_CLASS}>
                <SelectValue placeholder={TASK_FORM.priorityPlaceholder}>
                  {TASK_PRIORITY_OPTIONS[values.priority as 1 | 2 | 3 | 4 | 5]
                    ?.label ?? values.priority}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {TASK_PRIORITY_OPTIONS[n].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.priority ? (
              <p className="text-xs text-destructive">{fieldErrors.priority}</p>
            ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="task-status">{TASK_FORM.statusLabel}</Label>
          <Select
            value={values.status}
            onValueChange={(v) => {
              if (v) {
                setField("status", v as TaskStatus);
              }
            }}
          >
            <SelectTrigger id="task-status" className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder={TASK_FORM.statusPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {(["todo", "in_progress", "done"] as TaskStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.status ? (
            <p className="text-xs text-destructive">{fieldErrors.status}</p>
          ) : null}
        </div>
      </form>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={pending}
        >
          {TASK_FORM.cancel}
        </Button>
        <Button type="submit" form={FORM_ID} disabled={pending}>
          {pending
            ? TASK_FORM.saving
            : mode === "create"
              ? TASK_FORM.create
              : TASK_FORM.save}
        </Button>
      </DialogFooter>
    </>
  );
}

export function TaskFormDialog({
  mode,
  task,
  open,
  onOpenChange,
}: TaskFormDialogProps) {
  const formKey = `${mode}-${task?.id ?? "create"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-lg">
        {open ? (
          <TaskFormBody
            key={formKey}
            mode={mode}
            task={task}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
