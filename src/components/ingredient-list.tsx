"use client";

import { Check } from "lucide-react";
import { useState } from "react";

/** Zutaten zum Abhaken – beim Einkaufen oder Kochen. */
export function IngredientList({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<number[]>([]);

  return (
    <ul className="divide-y divide-line">
      {items.map((item, index) => {
        const done = checked.includes(index);
        return (
          <li key={index}>
            <button
              type="button"
              onClick={() => setChecked((c) => (done ? c.filter((i) => i !== index) : [...c, index]))}
              className="flex w-full items-center gap-3 py-2.5 text-left"
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  done ? "border-accent bg-accent text-accent-ink" : "border-line"
                }`}
              >
                {done && <Check className="size-3" strokeWidth={3} />}
              </span>
              <span className={done ? "text-muted line-through" : ""}>{item}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
