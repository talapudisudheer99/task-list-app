import { PageContainer } from "@/components/page-container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TASKS_TABLE } from "@/lib/constants/tasks";

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell className="w-10">
        <div className="size-4 animate-pulse rounded bg-muted" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-64 animate-pulse rounded bg-muted" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </TableCell>
      <TableCell>
        <div className="h-5 w-8 animate-pulse rounded-full bg-muted" />
      </TableCell>
      <TableCell>
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <div className="size-8 animate-pulse rounded bg-muted" />
          <div className="size-8 animate-pulse rounded bg-muted" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function TasksLoading() {
  return (
    <main className="flex flex-1 flex-col py-6">
      <PageContainer className="flex flex-col gap-6">
        <div>
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-8 w-full max-w-md animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-28 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-28 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>{TASKS_TABLE.title}</TableHead>
              <TableHead className="w-32">{TASKS_TABLE.dueDate}</TableHead>
              <TableHead className="w-24">{TASKS_TABLE.priority}</TableHead>
              <TableHead className="w-28">{TASKS_TABLE.status}</TableHead>
              <TableHead className="w-24 text-right">
                {TASKS_TABLE.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </TableBody>
        </Table>
      </PageContainer>
    </main>
  );
}
