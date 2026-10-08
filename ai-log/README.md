# AI session logs

Complete exports of the AI sessions used to build this project (see Redactions below).

| File | Tool | What it covers |
|---|---|---|
| `00-summary.md` | – | Short overview written afterwards to help reviewers skim. **Not a log.** |
| `01-claude-planning-and-review.md` | Claude (desktop app) | Plan, user stories and acceptance criteria, database schema + RLS SQL, import function SQL, sample CSVs, code reviews, test checklists, README |
| `02-cursor-implementation.md` | Cursor (Agent) | Implementation of sign-in, task CRUD/list, CSV import and tests from the backlog prompts |
| `03-chatgpt-ui-mockup.md` | ChatGPT | UI reference mockup prompts (the generated image is not committed) |

Logs are exported as-is.

## Redactions
Only privacy-related or clearly unrelated content was removed; everything about building the project is unchanged.

- `01-claude-planning-and-review.md`: converted from the stored session transcript. Screenshots appear as `[image]` (binary files are not committed); long tool outputs are shortened.
- One company name replaced with `[COMPANY]` and the recruiter's first name with `[RECRUITER]` (the brief asks for no company name in the repo).
- Supabase secret keys, if any appeared, replaced with `[REDACTED]`; that key has also been rotated.
- `03-chatgpt-ui-mockup.md`: text copied from ChatGPT; generated images are not included. The first prompt did not come through in the copy and is referenced from the Claude log.
- `01-claude-planning-and-review.md` is trimmed to the project-building conversation. Removed: a discussion about which Cursor subscription plan to buy, questions about what the ai-log folder means, interview-answer framing practice (including an internal coaching-skill prompt with personal career details), duplicated/interrupted messages, and some additional off-topic messages removed by me while reviewing. All planning, SQL, code review, testing and bug-fix discussion is kept.
- Demo-video recording preparation (script, recording setup, upload steps) and submission email drafting removed from `01-claude-planning-and-review.md` – not part of building the app.
