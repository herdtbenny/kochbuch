"use client";

import { BookOpen, ChartColumn, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UnreadActivity } from "@/lib/activity-format";
import { Notifications } from "./notifications";
import { RandomRecipeDialog } from "./random-recipe-dialog";

const itemClass =
  "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors";

export function BottomNav({ activity }: { activity: UnreadActivity }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const tone = (href: string) => (active(href) ? "text-accent" : "text-muted");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <div className="mx-auto flex max-w-sm items-center gap-1 rounded-full border border-line bg-surface/95 p-1.5 shadow-lg shadow-black/5">
        <Link href="/rezepte/neu" aria-label="Neues Rezept" className={`${itemClass} bg-accent text-accent-ink shadow-md`}>
          <Plus className="size-5" strokeWidth={2.5} />
          Neu
        </Link>
        <Link href="/" className={`${itemClass} ${tone("/")}`}>
          <BookOpen className="size-5" />
          Rezepte
        </Link>
        <Link href="/statistik" className={`${itemClass} ${tone("/statistik")}`}>
          <ChartColumn className="size-5" />
          Statistik
        </Link>
        <RandomRecipeDialog triggerClass={`${itemClass} text-muted`} />
        <Notifications initial={activity} triggerClass={`${itemClass} ${tone("/aktivitaet")}`} />
      </div>
    </nav>
  );
}
