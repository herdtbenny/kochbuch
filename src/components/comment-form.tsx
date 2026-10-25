"use client";

import { LoaderCircle } from "lucide-react";
import { useTransition, type FormEvent } from "react";
import { saveRatingComment } from "@/lib/actions";
import { SAVE_FAILED, toast } from "@/lib/toast";

export function CommentForm({ recipeId, comment }: { recipeId: number; comment: string | null }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const text = String(formData.get("comment") ?? "").trim();
    startTransition(async () => {
      try {
        await saveRatingComment(recipeId, formData);
        toast(text ? "Kommentar gespeichert" : "Kommentar entfernt");
      } catch {
        toast(SAVE_FAILED, "error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        name="comment"
        defaultValue={comment ?? ""}
        placeholder="Kommentar, z. B. „mehr Knoblauch“"
        className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={pending}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-70"
      >
        {pending && <LoaderCircle className="size-4 animate-spin" />}
        {pending ? "Speichert" : "Speichern"}
      </button>
    </form>
  );
}
