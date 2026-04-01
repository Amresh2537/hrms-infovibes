/** IST is UTC+5:30 */
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/**
 * Converts a UTC Date to its IST equivalent (still a JS Date, but
 * using UTC slots to hold IST wall-clock values).
 */
export function toIST(date = new Date()): Date {
  return new Date(date.getTime() + IST_OFFSET_MS);
}

/** Midnight IST at the start of the day that contains `date` (returned as UTC). */
export function startOfDay(date = new Date()) {
  const ist = toIST(date);
  const midnightIST = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  return new Date(midnightIST - IST_OFFSET_MS);
}

/** 23:59:59.999 IST at the end of the day that contains `date` (returned as UTC). */
export function endOfDay(date = new Date()) {
  const ist = toIST(date);
  const endIST = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 23, 59, 59, 999);
  return new Date(endIST - IST_OFFSET_MS);
}

/** First moment of month `month` (1-based) in IST, returned as UTC. */
export function startOfMonth(year: number, month: number) {
  const startIST = Date.UTC(year, month - 1, 1, 0, 0, 0, 0);
  return new Date(startIST - IST_OFFSET_MS);
}

/** Last moment of month `month` (1-based) in IST, returned as UTC. */
export function endOfMonth(year: number, month: number) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const endIST = Date.UTC(year, month - 1, daysInMonth, 23, 59, 59, 999);
  return new Date(endIST - IST_OFFSET_MS);
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}