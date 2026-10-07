import { TasksView } from "@/app/tasks/_components/tasks-view";
import { PageContainer } from "@/components/page-container";
import { TASKS_PAGE } from "@/lib/constants/tasks";
import {
  countActiveTasks,
  fetchTasks,
  filtersAreActive,
  parseTaskFilters,
} from "@/lib/tasks/queries";
import { createClient } from "@/lib/supabase/server";
import type { TasksSearchParams } from "@/lib/types/tasks";

type TasksPageProps = {
  searchParams: Promise<TasksSearchParams>;
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const filters = parseTaskFilters(params);

  const supabase = await createClient();
  const [{ tasks, error }, totalActive] = await Promise.all([
    fetchTasks(supabase, filters),
    countActiveTasks(supabase),
  ]);

  if (error) {
    throw error;
  }

  const hasFilters = filtersAreActive(filters);

  return (
    <main className="flex flex-1 flex-col py-6 sm:py-8">
      <PageContainer className="flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl tracking-tight">{TASKS_PAGE.title}</h1>
            <p className="mt-1.5 text-muted-foreground">{TASKS_PAGE.subtitle}</p>
          </div>
          {totalActive > 0 ? (
            <p className="text-sm font-medium text-muted-foreground tabular-nums">
              {hasFilters
                ? TASKS_PAGE.taskCountFiltered(tasks.length, totalActive)
                : TASKS_PAGE.taskCount(tasks.length)}
            </p>
          ) : null}
        </div>

        <TasksView
          tasks={tasks}
          filters={filters}
          hasFilters={hasFilters}
          hasAnyTasks={totalActive > 0}
        />
      </PageContainer>
    </main>
  );
}
