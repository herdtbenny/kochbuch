"use client";

import { CalendarCheck, LoaderCircle } from "lucide-react";
import { useTransition } from "react";
import { markCookedToday } from "@/lib/actions";
import { SAVE_FAILED, toast } from "@/lib/toast";

export function CookedTodayButton({ recipeId, cookedToday }: { recipeId: number; cookedToday: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || cookedToday}
      onClick={() =>
        startTransition(async () => {
          try {
            await markCookedToday(recipeId);
            toast("Als heute gekocht eingetragen");
          } catch {
            toast(SAVE_FAILED, "error");
          }
        })
      }
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium disabled:opacity-60"
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <CalendarCheck className="size-4" />}
      {cookedToday ? "Heute gekocht ✓" : "Heute gekocht"}
    </button>
  );
}
