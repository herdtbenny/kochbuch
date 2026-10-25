"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { CATEGORIES } from "@/lib/categories";
import { SORTS, type Sort } from "@/lib/sorts";


const chipClass = "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors";

export function RecipeFilters({ q, kat, sort }: { q: string; kat: string; sort: Sort }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(q);
  const first = useRef(true);

  function navigate(next: { q?: string; kat?: string; sort?: Sort }) {
    const values = { q: query, kat, sort, ...next };
    const params = new URLSearchParams();
    if (values.q) params.set("q", values.q);
    if (values.kat) params.set("kat", values.kat);
    if (values.sort !== "zuletzt") params.set("sort", values.sort);
    const search = params.toString();
    startTransition(() => router.replace(search ? `/?${search}` : "/", { scroll: false }));
  }

  // Suche leicht verzögert anwenden
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => navigate({ q: query }), 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const chips = [
    { value: "", label: "Alle" },
    { value: "nie", label: "Noch nie gekocht" },
    ...CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Suchen</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gericht oder Zutat …"
            className="w-full rounded-full border border-line bg-surface py-2.5 pr-10 pl-10 outline-none focus:border-accent [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Suche leeren"
              className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted"
            >
              <X className="size-4" />
            </button>
          )}
        </label>
        <label>
          <span className="sr-only">Sortieren</span>
          <select
            value={sort}
            onChange={(e) => navigate({ sort: e.target.value as Sort })}
            className="h-full max-w-36 appearance-none truncate rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-accent"
          >
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {chips.map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => navigate({ kat: chip.value })}
            className={`${chipClass} ${
              kat === chip.value ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
