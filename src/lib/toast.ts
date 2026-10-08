"use client";

import { toast } from "sonner";

const counts = new Map<string, number>();
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

const RESET_MS = 4000;

export function toastCountedSuccess(
  id: string,
  label: (count: number) => string,
) {
  const next = (counts.get(id) ?? 0) + 1;
  counts.set(id, next);

  toast.success(label(next), { id });

  const previous = timeouts.get(id);
  if (previous) {
    clearTimeout(previous);
  }

  timeouts.set(
    id,
    setTimeout(() => {
      counts.delete(id);
      timeouts.delete(id);
    }, RESET_MS),
  );
}
