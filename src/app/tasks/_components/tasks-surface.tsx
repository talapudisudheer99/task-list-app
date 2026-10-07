import { cn } from "@/lib/utils";

type TasksSurfaceProps = {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
};

/** Shared card shell for toolbar, table, and empty states. */
export function TasksSurface({
  children,
  className,
  padded = false,
}: TasksSurfaceProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        padded && "p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
