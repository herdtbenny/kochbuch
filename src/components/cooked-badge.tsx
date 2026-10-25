import { formatDate } from "@/lib/format-date";

/** "Zuletzt gekocht: …" oder ein TODO-Kennzeichen, wenn noch nie gekocht. */
export function CookedBadge({ date, className = "" }: { date: string | null; className?: string }) {
  if (!date) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold tracking-wide text-accent-ink ${className}`}
      >
        TODO
      </span>
    );
  }
  return <span className={`text-xs text-muted ${className}`}>Zuletzt gekocht: {formatDate(date)}</span>;
}
