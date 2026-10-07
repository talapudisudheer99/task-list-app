/** Client- and server-safe check for CSV uploads. */
export function isCsvFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".csv") || file.type === "text/csv";
}
