"use client";

import { useOptimistic, useTransition } from "react";
import { rateRecipe } from "@/lib/actions";

/** 1–10 zum Antippen, speichert sofort. */
export function RatingPicker({ recipeId, score, activeClass }: { recipeId: number; score?: number; activeClass: string }) {
  const [optimistic, setOptimistic] = useOptimistic(score);
  const [, startTransition] = useTransition();

  return (
    <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Deine Bewertung">
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
                await rateRecipe(recipeId, value);
              })
            }
            className={`aspect-square rounded-full text-sm font-semibold tabular-nums transition-colors ${
              selected ? `${activeClass} text-white` : optimistic && value < optimistic ? "bg-line text-ink" : "bg-paper text-muted"
            }`}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
