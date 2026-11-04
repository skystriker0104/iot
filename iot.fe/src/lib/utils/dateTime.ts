/**
 * Utility functions for formatting and parsing date-time values
 * Standard format: HH:mm:ss dd/MM/YYYY (e.g. 20:15:05 22/09/2026)
 */

export function formatAppDateTime(date: Date = new Date()): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${hh}:${mm}:${ss} ${d}/${m}/${y}`;
}

/**
 * Normalizes any timestamp string (ISO, YYYY-MM-DD HH:mm:ss, or dd/MM/yyyy HH:mm:ss)
 * into standard HH:mm:ss dd/MM/YYYY format.
 */
export function normalizeToAppDateTime(input: string | Date): string {
  if (!input) return '';
  if (input instanceof Date) return formatAppDateTime(input);

  const raw = input.trim();
  // If already in "HH:mm:ss dd/MM/yyyy" format:
  if (/^\d{2}:\d{2}:\d{2}\s+\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    return raw;
  }

  // Handle "dd/MM/yyyy HH:mm:ss" -> swap to "HH:mm:ss dd/MM/yyyy"
  const ddmmyyyyMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}:\d{2}(?::\d{2})?)$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year, timePart] = ddmmyyyyMatch;
    const timeNorm = timePart.length === 5 ? `${timePart}:00` : timePart;
    return `${timeNorm} ${day}/${month}/${year}`;
  }

  // Handle "yyyy-MM-dd HH:mm:ss" -> "HH:mm:ss dd/MM/yyyy"
  const yyyymmddMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2}(?::\d{2})?)$/);
  if (yyyymmddMatch) {
    const [, year, month, day, timePart] = yyyymmddMatch;
    const timeNorm = timePart.length === 5 ? `${timePart}:00` : timePart;
    return `${timeNorm} ${day}/${month}/${year}`;
  }

  // Fallback parsing via standard Date
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return formatAppDateTime(parsed);
  }

  return raw;
}
