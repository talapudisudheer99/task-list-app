/**
 * Escape user text before using it inside a PostgREST ilike pattern.
 * Also removes commas and parentheses so the .or() filter string stays valid.
 */
export function escapeIlikePattern(raw: string): string {
  return raw
    .trim()
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/[,()]/g, "")
    .replace(/"/g, "");
}
