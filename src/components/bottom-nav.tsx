"use client";

import { BookOpen, ChartColumn, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RandomRecipeDialog } from "./random-recipe-dialog";

const itemClass = "flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-[11px] font-medium transition-colors";

export function BottomNav() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const tone = (href: string) => (active(href) ? "text-accent" : "text-muted");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <div className="mx-auto flex max-w-sm items-center justify-between rounded-full border border-line bg-surface/90 p-1.5 shadow-lg shadow-black/5 backdrop-blur-md">
        <Link href="/" className={`${itemClass} ${tone("/")}`}>
          <BookOpen className="size-5" />
          Rezepte
        </Link>
        <RandomRecipeDialog triggerClass={`${itemClass} text-muted`} />
        <Link
          href="/rezepte/neu"
          aria-label="Neues Rezept"
          className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-ink shadow-md"
        >
          <Plus className="size-6" />
        </Link>
        <Link href="/statistik" className={`${itemClass} ${tone("/statistik")}`}>
          <ChartColumn className="size-5" />
          Statistik
        </Link>
      </div>
    </nav>
  );
}
