"use client";

import { useOptimistic, useTransition } from "react";
import { rateRecipe } from "@/lib/actions";
import { SAVE_FAILED, toast } from "@/lib/toast";

/** 1–10 zum Antippen, speichert sofort. */
export function RatingPicker({ recipeId, score, activeClass }: { recipeId: number; score?: number; activeClass: string }) {
  const [optimistic, setOptimistic] = useOptimistic(score);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-1.5">
      <div
        className={`grid grid-cols-5 gap-1.5 transition-opacity ${pending ? "opacity-70" : ""}`}
        role="radiogroup"
        aria-label="Deine Bewertung"
        aria-busy={pending}
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => {
          const selected = optimistic === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() =>
                startTransition(async () => {
                  setOptimistic(value);
                  try {
                    await rateRecipe(recipeId, value);
                    toast(`Bewertung gespeichert: ${value}/10`);
                  } catch {
                    toast(SAVE_FAILED, "error");
                  }
                })
              }
              className={`aspect-square rounded-full text-sm font-semibold tabular-nums transition-colors ${
                selected
                  ? `${activeClass} text-white`
                  : optimistic && value < optimistic
                    ? "bg-line text-ink"
                    : "bg-paper text-muted"
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
      <p className="h-4 text-right text-xs text-muted" aria-live="polite">
        {pending ? "Speichert …" : ""}
      </p>
    </div>
  );
}
