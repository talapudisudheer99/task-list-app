-- 001: tasks table + row-level security (US-2, US-3..US-7)
-- Run once in Supabase → SQL Editor.

-- 1) The table ---------------------------------------------------------------
create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  -- owner of the task; defaults to the signed-in user
  user_id     uuid not null default auth.uid()
              references auth.users (id) on delete cascade,
  title       text not null
              check (char_length(trim(title)) between 1 and 200),
  notes       text,
  due_date    date,
  priority    smallint not null default 3
              check (priority between 1 and 5),
  status      text not null default 'todo'
              check (status in ('todo', 'in_progress', 'done')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz          -- soft delete: null = active
);

-- 2) Indexes -----------------------------------------------------------------
-- Fast "my active tasks, sorted by due date" query.
create index tasks_user_active_idx
  on public.tasks (user_id, due_date)
  where deleted_at is null;

-- Duplicate guard: one active task per user with the same title + due date.
-- (Title compared trimmed and case-insensitive. Rows with no due date never clash.)
create unique index tasks_user_title_due_unique
  on public.tasks (user_id, lower(trim(title)), due_date)
  where deleted_at is null;

-- 3) Keep updated_at current on every update ----------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- 4) Row-level security ------------------------------------------------------
alter table public.tasks enable row level security;

-- Only signed-in users may touch the table at all (anonymous gets nothing).
grant select, insert, update on public.tasks to authenticated;

create policy "Users can read their own tasks"
  on public.tasks for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create their own tasks"
  on public.tasks for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own tasks"
  on public.tasks for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- No DELETE policy on purpose: rows are never hard-deleted from the app.
-- "Delete" = update deleted_at (soft delete), and the app filters deleted_at is null.
