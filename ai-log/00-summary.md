# Summary of AI usage (written afterwards – NOT a log)

This is a short overview to help reviewers skim. The real, exported session logs are the other files in this folder.

| Phase | AI tool | What AI did | What I did / decided |
|---|---|---|---|
| Plan | Claude | Proposed phases, wrote user stories + acceptance criteria (`docs/BACKLOG.md`) | Chose stack details (shadcn, Tailwind), approved scope |
| UI reference | ChatGPT | Generated a layout mockup (image not committed) | Reviewed it, listed corrections; backlog "UI guidelines" overrule the image |
| Database | Claude | Wrote `001_tasks_and_rls.sql` and `002_import_tasks_function.sql`, explained each line | Ran them in Supabase, verified table/RLS/policies with a check query |
| Auth, CRUD, import, tests | Cursor | Implemented each story from backlog prompts | Tested every acceptance criterion manually, reported failures back |
| Review | Claude | Reviewed Cursor's code, ran type-check/lint, wrote test checklists and sample CSVs | Ran all checklists, confirmed results with screenshots |
| Docs & demo | Claude | Drafted README, demo script | Recorded the demo, deployed to Vercel |

## Issues found while testing (and fixed)
- Sign-up failed with "Email not confirmed" → Supabase setting changed, decision D9 recorded.
- CSV import failed because the `import_tasks` migration had not been run → ran it; app showed a clear error instead of crashing.
- "In progress" status was only reachable from the Edit dialog → backlog updated, inline status dropdown added.
- Wrong-header CSV showed a confusing empty summary → UI adjusted.
- Vitest config warning → config renamed to `.mts`.
