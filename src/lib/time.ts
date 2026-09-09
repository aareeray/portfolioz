/** Time / timezone formatting utilities (used by the live-time component and server). */

/**
 * Format the current local time for a given IANA timezone, e.g. "14:07".
 * Falls back to the runtime's local time if the timezone is invalid.
 */
export function formatTimeInZone(
  timezone: string,
  date: Date = new Date(),
): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }
}

/** Return a short timezone abbreviation, e.g. "GMT+7". */
export function timezoneLabel(
  timezone: string,
  date: Date = new Date(),
): string {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? timezone;
  } catch {
    return timezone;
  }
}

/** Current four-digit year (for footer copyright). */
export function currentYear(date: Date = new Date()): number {
  return date.getFullYear();
}
