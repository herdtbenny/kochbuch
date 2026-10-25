"use client";

import { ArrowUpDown, ListFilter, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { CATEGORIES } from "@/lib/categories";
import { SORTS, type Sort } from "@/lib/sorts";
import { ChipMenu } from "./chip-menu";

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
    if (values.sort !== "neu") params.set("sort", values.sort);
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

  const filters = [
    { value: "", label: "Alle" },
    { value: "todo", label: "TODO" },
    ...CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="space-y-3">
      <label className="relative block">
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

      <div className="flex items-center justify-between gap-2">
        <ChipMenu
          icon={ListFilter}
          label="Filter"
          value={kat}
          options={filters}
          onChange={(value) => navigate({ kat: value })}
          highlight={kat !== ""}
        />
        <ChipMenu
          icon={ArrowUpDown}
          label="Sortieren"
          value={sort}
          options={Object.entries(SORTS).map(([value, label]) => ({ value, label }))}
          onChange={(value) => navigate({ sort: value as Sort })}
          align="right"
        />
      </div>
    </div>
  );
}
