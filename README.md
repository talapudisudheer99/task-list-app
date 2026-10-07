# Task List App

A small task-list web app with CSV import.
Each user signs in and sees **only their own tasks** – enforced by Postgres row-level security (RLS), not just app code.

**Demo video:** _add link here_

## Features

- Email + password sign-up / sign-in / sign-out (Supabase Auth, cookie sessions)
- Create, edit, complete and **soft-delete** tasks (title, notes, due date, priority 1–5, status)
- Task list with search (title + notes), status and priority filters, sorted by due date
- Loading (skeleton), empty ("No tasks yet" / "No tasks match your filters") and error ("Try again") states
- **CSV import**: server-side validation of every row, valid rows inserted in **one transaction**,
  rejected rows shown with row number + reason and downloadable as CSV
- Duplicate detection (same title + due date) inside the file **and** against the user's existing tasks

## Tech stack

TypeScript · Next.js 16 (App Router, Server Actions) · Node.js · PostgreSQL via Supabase (Auth, RLS, RPC) ·
Tailwind CSS v4 · shadcn/ui · papaparse (CSV parsing) · Vitest (tests)

---

## Getting started

### Prerequisites
- Node.js 20+ and npm
- A free [Supabase](https://supabase.com) project

### 1. Install
```bash
git clone https://github.com/talapudisudheer99/task-list-app.git
cd task-list-app
npm install
```

### 2. Environment variables
```bash
cp .env.example .env.local
```
Fill in `.env.local` from **Supabase → Project Settings → API Keys**:

| Variable | Where it is used | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | app + tests | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | app + tests | Publishable (or legacy *anon*) key. Safe in the browser – RLS protects the data. |
| `SUPABASE_SERVICE_ROLE_KEY` | **tests only** | Secret (or legacy *service_role*) key. Bypasses RLS – never exposed to the browser, never committed. |

`.env.local` is git-ignored. Only `.env.example` (placeholders) is committed.

### 3. Database (run once)
In **Supabase → SQL Editor**, run these files in order:
1. `supabase/migrations/001_tasks_and_rls.sql` – `tasks` table, indexes, RLS policies
2. `supabase/migrations/002_import_tasks_function.sql` – `import_tasks()` function used by CSV import

Then in **Authentication → Sign In / Providers → Email**, turn **Confirm email** off (see decision D9 below).

### 4. Run
```bash
npm run dev
```
Open http://localhost:3000, create an account and you land on `/tasks`.

### Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm test` | Run all tests once (Vitest) |
| `npm run test:watch` | Tests in watch mode |

---

## Tests

```bash
npm test
```

| File | Type | Covers |
|---|---|---|
| `src/lib/import/validate-row.test.ts` | unit | Title missing / whitespace / 200 vs 201 chars; priority `high`, `3.5`, `0`, `6`; dates `2026-02-30`, `2026-13-01`, `10/10/2026`, leap day |
| `src/lib/import/parse-csv.test.ts` | unit | Quoted commas, CRLF, blank rows, spreadsheet row numbers, header order/case/BOM, missing headers, `samples/edge-cases.csv` end-to-end |
| `src/lib/import/duplicates.test.ts` | unit | Duplicate title + date in the same file (case-insensitive, trimmed); same title with another date is allowed |
| `tests/rls.test.ts` | integration (real Supabase DB) | Two users: B cannot read, read-by-id, update, or insert-as A. A can read their own task. |

The RLS test uses the secret key **only** to create two temporary users (`rls-test-…@example.com`) and delete them
afterwards; all checks run through normal signed-in clients using the public key, exactly like the browser.
If the env vars are missing, the RLS suite is skipped with a message.

---

## CSV import

Columns: `title, due_date, priority, notes` (any order, case-insensitive).

A row is **rejected** when:
- `title` is missing or longer than 200 characters
- `due_date` is not a real calendar date in `YYYY-MM-DD` format (e.g. `2026-02-30` is rejected)
- `priority` is not a whole number from 1 to 5 (e.g. `high`, `3.5`)
- it duplicates an earlier row in the file (same title + due date) – *"Duplicate of row N in this file"*
- the same title + due date already exists in the user's tasks – *"Task with this title and due date already exists"*

Blank rows are skipped and counted, not rejected. Row numbers match the spreadsheet (header = row 1).

### Sample files (`samples/`)
| File | Expected result |
|---|---|
| `edge-cases.csv` | **4 imported · 5 rejected · 1 blank row skipped** (CRLF endings, quoted commas, empty row, priority `high`, 217-char title, duplicate, Feb 30). Import it **twice** to see account-level duplicates. |
| `valid-tasks.csv` | 5 imported |
| `reordered-columns.csv` | 2 imported (different column order, uppercase headers, BOM) |
| `wrong-headers.csv` | File-level error: required columns missing |
| `header-only.csv` | 0 imported, no error |
| `not-a-csv.txt` | Rejected: only `.csv` files |

---

## Design overview

### Schema (`public.tasks`)
| Column | Type | Rules |
|---|---|---|
| `id` | uuid | primary key |
| `user_id` | uuid | references `auth.users`, defaults to `auth.uid()` |
| `title` | text | required, 1–200 chars after trim (CHECK) |
| `notes` | text | optional |
| `due_date` | date | optional in the app, required in CSV |
| `priority` | smallint | 1–5 (CHECK), default 3 |
| `status` | text | `todo` / `in_progress` / `done` (CHECK), default `todo` |
| `created_at`, `updated_at` | timestamptz | `updated_at` maintained by a trigger |
| `deleted_at` | timestamptz | **soft delete** – `null` means active |

Indexes: `(user_id, due_date) where deleted_at is null` for the list, and a **unique** index on
`(user_id, lower(trim(title)), due_date) where deleted_at is null` – the database itself prevents duplicates.

### Row-level security
- RLS is enabled on `tasks`; only the `authenticated` role is granted `select, insert, update`.
- Policies for **select / insert / update** all require `user_id = auth.uid()`.
- There is **no delete policy**: hard deletes are impossible from the app. "Delete" sets `deleted_at`,
  and every query filters `deleted_at is null`. (Visibility of deleted rows is handled in the query, not the
  select policy, so the soft-delete update itself is not blocked by RLS.)
- Server code uses the user's session (publishable key + cookie), so every query runs **as that user**.
  The secret key is only used by tests.

### Request / auth flow
```
Browser ─► src/proxy.ts (refresh session, redirect signed-out users to /login)
        ─► Server Component / Server Action
        ─► Supabase client with the user's cookie ─► Postgres (RLS checks auth.uid())
```
Pages check the user again with `getClaims()` (defence in depth); RLS is the final guarantee.

### CSV import flow
```
Upload (.csv, ≤ 1 MB)
  └─► Server Action importTasks
        1. parseCsv          papaparse: quoted commas, CRLF, BOM, blank rows, row numbers
        2. validateCsvRow    title / due_date / priority rules (shared with the task form)
        3. findDuplicatesInFile   same title + date earlier in the file
        4. supabase.rpc('import_tasks')  ── ONE transaction in Postgres
              insert ... on conflict (unique index) do nothing → reports rows already in the account
  └─► { imported, rejected[{row, reason}], blankRows }  →  dialog + "Download rejected rows" (CSV)
```

**Why a Postgres function (RPC) for the insert?**
A single function call runs in **one transaction**: either all valid rows are saved or none are – no half-finished
imports. It runs as the signed-in user (`security invoker`), so RLS still applies, and the duplicate check against the
account happens **inside the database** using the unique index, so two imports at the same time cannot create duplicates.
Steps 1–3 are plain TypeScript functions in `src/lib/import/` with no React or database code, which is why they are easy
to unit-test.

### Project structure
```
src/
  proxy.ts                  session refresh + route protection
  app/login/                sign-in / sign-up page and Server Actions
  app/tasks/                list page, loading/error states, Server Actions, import action, UI components
  lib/tasks/                validation (shared), queries, search escaping
  lib/import/               parse-csv, validate-row, duplicates, rejected-csv (+ unit tests)
  lib/supabase/server.ts    server Supabase client (cookies)
supabase/migrations/        SQL: table + RLS, import function
tests/rls.test.ts           RLS integration test
samples/                    CSV files for manual testing and the demo
docs/BACKLOG.md             user stories, acceptance criteria, product decisions
```

### Product decisions
Recorded in [`docs/BACKLOG.md`](docs/BACKLOG.md). Key ones:
- **D3** Row number = spreadsheet row (header is row 1).
- **D4** Blank rows are skipped and counted, not rejected.
- **D6** Duplicate key = `lower(trim(title))` + `due_date`; soft-deleted tasks do not count.
- **D8** Priority 1 = low, 5 = urgent.
- **D9** Email confirmation is off for the demo so reviewers can sign up instantly (would be on in production).

---

## What I would do next

- **End-to-end tests** with Playwright for sign-in, task CRUD and the CSV import flow.
- **Supabase CLI migrations** (`supabase db push`) instead of pasting SQL, so migrations are tracked and applied automatically.
- Turn **email confirmation** back on, with a "check your email" message after sign-up and a callback route.
- **Pagination** (or infinite scroll) for large task lists, and a server-side limit on CSV size / row count with streaming parsing.
- **Restore / trash view** for soft-deleted tasks.
- Optimistic UI updates for complete / delete.
- Show "not found" when an update or delete affects 0 rows.
- Bulk actions (complete / delete selected), sorting by column, and keyboard shortcuts.
- Accessibility pass (screen-reader labels, focus management in dialogs) and a dark-mode toggle (the theme already supports it).
- CI (GitHub Actions) running lint, type-check and unit tests on every push.

## AI usage

This project was built with AI assistance (Claude for planning, product ownership and review; Cursor for implementation;
ChatGPT for a UI reference mockup). The complete, unedited session logs are in [`ai-log/`](ai-log/).
