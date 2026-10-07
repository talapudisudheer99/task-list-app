-- 002: import_tasks() – insert many tasks in ONE transaction (US-8, US-9)
-- Run once in Supabase → SQL Editor.
--
-- The app server has already validated every row and removed duplicates
-- inside the file. This function only does what the database must do:
--   * insert all valid rows atomically (a function call is one transaction:
--     if anything fails, nothing is saved),
--   * skip rows that already exist in the user's account (same title + due
--     date, case-insensitive, not soft-deleted) and report them back.
--
-- Input  p_rows: [{ "row_number": 2, "title": "...", "due_date": "2026-10-10",
--                   "priority": 4, "notes": "..." }, ...]
-- Output: { "inserted": 3, "duplicates": [{ "row_number": 7, "reason": "..." }] }

create or replace function public.import_tasks(p_rows jsonb)
returns jsonb
language plpgsql
security invoker          -- runs as the signed-in user, so RLS still applies
set search_path = ''
as $$
declare
  r              jsonb;
  new_id         uuid;
  inserted_count integer := 0;
  duplicates     jsonb   := '[]'::jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  for r in select * from jsonb_array_elements(p_rows)
  loop
    new_id := null;

    -- user_id and status use their column defaults (auth.uid(), 'todo').
    -- ON CONFLICT uses our unique index (user + lower(trim(title)) + due_date
    -- among active tasks): an existing task makes the insert do nothing.
    insert into public.tasks (title, notes, due_date, priority)
    values (
      r ->> 'title',
      nullif(r ->> 'notes', ''),
      (r ->> 'due_date')::date,
      (r ->> 'priority')::smallint
    )
    on conflict (user_id, (lower(trim(title))), due_date)
      where deleted_at is null
      do nothing
    returning id into new_id;

    if new_id is null then
      duplicates := duplicates || jsonb_build_array(jsonb_build_object(
        'row_number', (r ->> 'row_number')::integer,
        'reason', 'Task with this title and due date already exists'
      ));
    else
      inserted_count := inserted_count + 1;
    end if;
  end loop;

  return jsonb_build_object('inserted', inserted_count, 'duplicates', duplicates);
end;
$$;

-- Only signed-in users may call it.
revoke execute on function public.import_tasks(jsonb) from public, anon;
grant  execute on function public.import_tasks(jsonb) to authenticated;
