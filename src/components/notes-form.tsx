"use client";

import { LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { saveNotes } from "@/lib/actions";
import { SAVE_FAILED, toast } from "@/lib/toast";

/** Gemeinsame Notizen zum Rezept – beide können sie bearbeiten. */
export function NotesForm({ recipeId, notes }: { recipeId: number; notes: string | null }) {
  const [value, setValue] = useState(notes ?? "");
  const [pending, startTransition] = useTransition();
  const changed = value.trim() !== (notes ?? "").trim();

  function save() {
    startTransition(async () => {
      try {
        await saveNotes(recipeId, value);
        toast(value.trim() ? "Notizen gespeichert" : "Notizen gelöscht");
      } catch {
        toast(SAVE_FAILED, "error");
      }
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="z. B. „Beim nächsten Mal weniger Salz“ oder „Lisa mag’s schärfer“"
        aria-label="Notizen"
        className="w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 min-h-[5rem] outline-none [field-sizing:content] placeholder:text-muted/70 focus:border-accent"
      />
      {(changed || pending) && (
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-70"
        >
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          {pending ? "Speichert" : "Notizen speichern"}
        </button>
      )}
    </div>
  );
}
