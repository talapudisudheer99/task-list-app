# Product Backlog — Task List App

Single source of truth for features. Each story is built, demoed and committed
on its own (`feat: US-x <short name>`).

**Definition of Done (every story):** acceptance criteria pass locally,
no TypeScript/lint errors, committed and pushed, and I can explain it in 2 lines.

---

## Product decisions

| # | Decision | Why |
|---|----------|-----|
| D1 | Task status is one of `todo`, `in_progress`, `done` (default `todo`). | "Complete" = set to `done`; 3 states make the status filter useful. |
| D2 | Soft delete via `deleted_at timestamptz`. Deleted rows never appear in the UI. | Requirement; allows recovery/audit. |
| D3 | CSV row number = spreadsheet row (header is row 1, first data row is row 2). | Matches what the user sees in Excel/Sheets. |
| D4 | Blank rows are skipped, not rejected, and counted in the summary. | Requirement: parser must "handle" blank rows. |
| D5 | `due_date` is required in CSV import. | Rule: must be a valid YYYY-MM-DD date. |
| D6 | Duplicate key = `lower(trim(title))` + `due_date`. Soft-deleted tasks do not count. | Avoids "Buy milk" vs "buy milk " slipping through. |
| D7 | Import writes in one transaction via a Postgres function (RPC). | All-or-nothing insert; DB re-checks duplicates. |

---

## Epic A — Access & security

### US-1 Sign in
As a user, I can sign up, sign in and sign out with email + password.
- [ ] AC1: Signed-out user visiting `/tasks` is redirected to `/login`.
- [ ] AC2: After sign in, user lands on `/tasks`.
- [ ] AC3: Sign out ends the session and returns to `/login`.
- [ ] AC4: Wrong password shows a readable error message.

### US-2 Data isolation (RLS)
As a user, I can only ever see and change my own tasks.
- [ ] AC1: RLS is enabled on `tasks`.
- [ ] AC2: Policies for select / insert / update all require `user_id = auth.uid()`.
- [ ] AC3: User B querying the table gets 0 of User A's rows.
- [ ] AC4: An automated test (two test users) proves AC3.

---

## Epic B — Task management

### US-3 Create task
- [ ] AC1: Title required, max 200 characters.
- [ ] AC2: Priority is a whole number 1–5, default 3.
- [ ] AC3: Due date and notes are optional.
- [ ] AC4: New task has status `todo`.
- [ ] AC5: Invalid input shows a field error; nothing crashes.

### US-4 Edit task
- [ ] AC1: User can change title, notes, due date, priority, status.
- [ ] AC2: Same validation as US-3.

### US-5 Complete task
- [ ] AC1: One click toggles a task between `todo` and `done`.
- [ ] AC2: Completed tasks are visually distinct.

### US-6 Soft delete
- [ ] AC1: Delete sets `deleted_at` (row stays in DB).
- [ ] AC2: Task disappears from the list immediately.
- [ ] AC3: Deleted tasks never appear in list, search or duplicate checks.

### US-7 List, search and filters
- [ ] AC1: Search matches title or notes (case-insensitive).
- [ ] AC2: Filter by status and by priority.
- [ ] AC3: Sorted by due date (no date last).
- [ ] AC4: Loading state while fetching.
- [ ] AC5: Empty state: "No tasks yet" vs "No tasks match your filters".
- [ ] AC6: Error state shows a message instead of crashing.

---

## Epic C — CSV import

### US-8 Import tasks from CSV
As a user, I can upload a CSV (`title,due_date,priority,notes`) to add many tasks.
- [ ] AC1: Server parses the file with papaparse.
- [ ] AC2: Handles quoted fields with commas, blank rows, CRLF line endings.
- [ ] AC3: Server validates every row with our own pure functions:
  - title missing or > 200 chars → invalid
  - due_date not a real YYYY-MM-DD calendar date → invalid
  - priority not a whole number 1–5 → invalid
- [ ] AC4: Valid rows are inserted in a single transaction (Postgres function via RPC).
- [ ] AC5: Result shows "X imported, Y rejected, Z blank rows skipped" and a table of
      rejected rows with row number and reason.

### US-9 Duplicate handling
- [ ] AC1: Duplicate if same title + due date appears earlier in the file → reason
      "Duplicate of row N in this file".
- [ ] AC2: Duplicate if it already exists in the user's account → reason
      "Task with this title and due date already exists".
- [ ] AC3: Soft-deleted tasks are not counted as existing.

### US-10 Download rejected rows
- [ ] AC1: Button downloads `rejected-rows.csv` with columns
      `row_number,reason,title,due_date,priority,notes`.
- [ ] AC2: Values with commas/quotes are escaped correctly.

### US-11 Edge-case sample
- [ ] AC1: `samples/edge-cases.csv` contains: a duplicate, an empty row, priority "high",
      a title over 200 chars, and a quoted field with a comma.
- [ ] AC2: Importing it: valid rows import, each bad row is reported with a reason,
      app does not crash.

---

## Epic D — Quality & delivery

### US-12 Tests (`npm test`)
- [ ] AC1: Unit tests for row validation.
- [ ] AC2: Unit tests for duplicate handling.
- [ ] AC3: RLS test against the database with two test users.

### US-13 Docs & delivery
- [ ] AC1: README: setup, run, test, env vars, design overview, what I'd do next.
- [ ] AC2: `.env.example` with placeholder values only.
- [ ] AC3: `ai-log/` with exported AI sessions + `ai-log/README.md`.
- [ ] AC4: Screen recording link in README.

---

## Build order
Setup → US-2 (schema + RLS) → US-1 → US-3..US-7 → US-8..US-11 → US-12 → US-13
