"use client";

import { ListTodo, LoaderCircle } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { setTodo } from "@/lib/actions";
import { SAVE_FAILED, toast } from "@/lib/toast";

/** TODO an/aus – "wollen wir mal kochen". */
export function TodoToggle({ recipeId, todo }: { recipeId: number; todo: boolean }) {
  const [active, setActive] = useOptimistic(todo);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const next = !active;
          setActive(next);
          try {
            await setTodo(recipeId, next);
            toast(next ? "Als TODO markiert" : "TODO entfernt");
          } catch {
            toast(SAVE_FAILED, "error");
          }
        })
      }
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface"
      }`}
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <ListTodo className="size-4" />}
      TODO
    </button>
  );
}
