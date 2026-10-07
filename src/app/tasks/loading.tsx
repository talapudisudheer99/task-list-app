import { PageContainer } from "@/components/page-container";
import { TasksSurface } from "@/app/tasks/_components/tasks-surface";
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
    <TableRow className="hover:bg-transparent">
      <TableCell className="w-12 px-4">
        <div className="size-4 animate-pulse rounded bg-muted" />
      </TableCell>
      <TableCell className="px-4">
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-64 animate-pulse rounded bg-muted" />
      </TableCell>
      <TableCell className="px-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </TableCell>
      <TableCell className="px-4">
        <div className="h-6 w-8 animate-pulse rounded-full bg-muted" />
      </TableCell>
      <TableCell className="px-4">
        <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
      </TableCell>
      <TableCell className="px-4">
        <div className="flex justify-end gap-2">
          <div className="size-8 animate-pulse rounded-md bg-muted" />
          <div className="size-8 animate-pulse rounded-md bg-muted" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function TasksLoading() {
  return (
    <main className="flex flex-1 flex-col py-6 sm:py-8">
      <PageContainer className="flex flex-col gap-5 sm:gap-6">
        <div>
          <div className="h-9 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="mt-3 h-4 w-56 animate-pulse rounded bg-muted" />
        </div>
        <TasksSurface padded>
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-36 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-36 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-28 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-28 animate-pulse rounded-lg bg-muted" />
          </div>
        </TasksSurface>
        <TasksSurface>
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 bg-muted/40 px-4" />
                <TableHead className="bg-muted/40 px-4">
                  {TASKS_TABLE.title}
                </TableHead>
                <TableHead className="w-36 bg-muted/40 px-4">
                  {TASKS_TABLE.dueDate}
                </TableHead>
                <TableHead className="w-28 bg-muted/40 px-4">
                  {TASKS_TABLE.priority}
                </TableHead>
                <TableHead className="w-32 bg-muted/40 px-4">
                  {TASKS_TABLE.status}
                </TableHead>
                <TableHead className="w-28 bg-muted/40 px-4 text-right">
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
        </TasksSurface>
      </PageContainer>
    </main>
  );
}
