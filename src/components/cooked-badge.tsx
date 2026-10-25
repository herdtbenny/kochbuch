import { formatDate } from "@/lib/format-date";

/** "Zuletzt gekocht: …" – nichts, wenn kein Datum eingetragen ist. */
export function CookedBadge({ date, className = "" }: { date: string | null; className?: string }) {
  if (!date) return null;
  return <span className={`text-xs text-muted ${className}`}>Zuletzt gekocht: {formatDate(date)}</span>;
}

export function TodoBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold tracking-wide text-accent-ink">
      TODO
    </span>
  );
}
