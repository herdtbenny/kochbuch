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
      aria-pressed={cookedToday}
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
      className={`flex w-full items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
        cookedToday ? "border-benny bg-benny text-white" : "border-line bg-surface"
      }`}
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <CalendarCheck className="size-4" />}
      Heute gekocht
    </button>
  );
}
