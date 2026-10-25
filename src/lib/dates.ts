const DAY = 86_400_000;

/** Heutiges Datum als "YYYY-MM-DD" in deutscher Zeit (der Server läuft in UTC). */
export function todayBerlin() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date());
}

export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY);
}

export function relativeDay(date: string, today = todayBerlin()) {
  const days = daysBetween(date, today);
  if (days <= 0) return "heute";
  if (days === 1) return "gestern";
  if (days < 14) return `vor ${days} Tagen`;
  if (days < 60) return `vor ${Math.round(days / 7)} Wochen`;
  if (days < 365) {
    const months = Math.round(days / 30);
    return months === 1 ? "vor einem Monat" : `vor ${months} Monaten`;
  }
  const years = Math.round(days / 365);
  return years === 1 ? "vor einem Jahr" : `vor ${years} Jahren`;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(date),
  );
}
