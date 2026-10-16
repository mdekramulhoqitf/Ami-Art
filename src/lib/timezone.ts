// AMI ART operates in Bangladesh — "today"/"overdue"/"upcoming" for
// follow-ups must always be computed against the Asia/Dhaka calendar date,
// never the server process's ambient system timezone. Relying on
// `new Date(); x.setHours(0,0,0,0)` happens to be correct only when the
// server itself runs in Asia/Dhaka (true in this dev environment by
// coincidence) and silently wrong on any host running UTC or another zone
// (the common case for most cloud deploys) — every follow-up bucketing
// query must go through these helpers instead.
//
// Bangladesh Standard Time is a fixed UTC+6 offset with no DST, so a plain
// offset shift is exact — no Intl/timezone-database dependency needed.
const DHAKA_OFFSET_MS = 6 * 60 * 60000;

/** The UTC instant corresponding to 00:00:00 today, Asia/Dhaka. */
export function startOfTodayDhaka(): Date {
  const dhakaNow = new Date(Date.now() + DHAKA_OFFSET_MS);
  const y = dhakaNow.getUTCFullYear();
  const m = dhakaNow.getUTCMonth();
  const d = dhakaNow.getUTCDate();
  return new Date(Date.UTC(y, m, d) - DHAKA_OFFSET_MS);
}

/** The UTC instant corresponding to 23:59:59.999 today, Asia/Dhaka. */
export function endOfTodayDhaka(): Date {
  return new Date(startOfTodayDhaka().getTime() + 24 * 60 * 60000 - 1);
}

/** Start-of-day, Asia/Dhaka, `days` days from today (negative for past days). */
export function daysFromTodayDhaka(days: number): Date {
  return new Date(startOfTodayDhaka().getTime() + days * 24 * 60 * 60000);
}
