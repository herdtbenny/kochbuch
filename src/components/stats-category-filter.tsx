"use client";

import { ListFilter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CATEGORIES } from "@/lib/categories";
import { ChipMenu } from "./chip-menu";

/** Kategorie-Auswahl für die Top 5 (über ?kat= in der URL). */
export function StatsCategoryFilter({ value }: { value: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <ChipMenu
      icon={ListFilter}
      label="Kategorie"
      value={value}
      options={[{ value: "", label: "Alle" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]}
      onChange={(kat) =>
        startTransition(() => router.replace(kat ? `/statistik?kat=${encodeURIComponent(kat)}` : "/statistik", { scroll: false }))
      }
      align="right"
      highlight={value !== ""}
    />
  );
}
