"use client";

import { Trash } from "lucide-react";
import { useTransition } from "react";
import { deleteRecipe } from "@/lib/actions";

export function DeleteRecipeButton({ id, title }: { id: number; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`„${title}“ wirklich löschen? Fotos, Bewertungen und Kochtage gehen verloren.`)) {
          startTransition(() => deleteRecipe(id));
        }
      }}
      className="mx-auto flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-accent disabled:opacity-60"
    >
      <Trash className="size-4" />
      {pending ? "Wird gelöscht …" : "Rezept löschen"}
    </button>
  );
}
