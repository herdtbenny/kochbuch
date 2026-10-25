"use client";

/* eslint-disable @next/next/no-img-element -- Vorschauen sind lokale blob:-URLs */

import { ImagePlus, LoaderCircle, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { saveRecipe } from "@/lib/actions";
import { CATEGORIES, DEFAULT_CATEGORY } from "@/lib/categories";
import { todayBerlin } from "@/lib/format-date";
import { resizeImage } from "@/lib/resize-image";
import { SAVE_FAILED, toast } from "@/lib/toast";
import { ListInput } from "./list-input";

const MAX_NEW_PHOTOS = 8;

type ExistingRecipe = {
  id: number;
  title: string;
  category: string;
  description: string | null;
  ingredients: string;
  steps: string;
  minutes: number | null;
  servings: number | null;
  sourceUrl: string | null;
  lastCookedOn: string | null;
  photos: { id: number; url: string }[];
};

function toLines(text = "") {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const inputClass =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3 outline-none placeholder:text-muted/70 focus:border-accent";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-medium">
        {label}
        {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function RecipeForm({ recipe }: { recipe?: ExistingRecipe }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState("Speichern …");
  const [newPhotos, setNewPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [removed, setRemoved] = useState<number[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  // Vorschau-URLs wieder freigeben
  const previews = useRef(newPhotos);
  useEffect(() => {
    previews.current = newPhotos;
  }, [newPhotos]);
  useEffect(() => () => previews.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  const existing = recipe?.photos.filter((p) => !removed.includes(p.id)) ?? [];

  function addFiles(files: FileList | null) {
    if (!files) return;
    const room = MAX_NEW_PHOTOS - newPhotos.length;
    const added = Array.from(files)
      .slice(0, room)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setNewPhotos((current) => [...current, ...added]);
    if (files.length > room) setError(`Maximal ${MAX_NEW_PHOTOS} neue Fotos pro Speichern.`);
  }

  function removeNew(index: number) {
    setNewPhotos((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, i) => i !== index);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.delete("photoInput");
    removed.forEach((id) => formData.append("removePhoto", String(id)));
    setError(null);

    startTransition(async () => {
      try {
        if (newPhotos.length) setStage("Fotos werden vorbereitet …");
        for (const { file } of newPhotos) formData.append("photos", await resizeImage(file));
      } catch {
        setError("Ein Foto konnte nicht gelesen werden.");
        toast("Ein Foto konnte nicht gelesen werden.", "error");
        return;
      }

      setStage(newPhotos.length ? `${newPhotos.length === 1 ? "Foto wird" : "Fotos werden"} hochgeladen …` : "Speichern …");
      let result: Awaited<ReturnType<typeof saveRecipe>>;
      try {
        result = await saveRecipe(formData);
      } catch {
        setError(SAVE_FAILED);
        toast(SAVE_FAILED, "error");
        return;
      }
      if ("error" in result) {
        setError(result.error);
        toast(result.error, "error");
        return;
      }
      toast(recipe ? "Änderungen gespeichert" : "Rezept gespeichert");
      router.push(`/rezepte/${result.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {recipe && <input type="hidden" name="id" value={recipe.id} />}

      {/* Fotos */}
      <div>
        <p className="mb-1.5 text-sm font-medium">Fotos</p>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex aspect-square w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line text-sm text-muted"
          >
            <ImagePlus className="size-6" />
            Hinzufügen
          </button>
          {existing.map((photo) => (
            <div key={photo.id} className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-2xl bg-line">
              <Image src={photo.url} alt="" fill sizes="112px" className="object-cover" />
              <RemoveButton onClick={() => setRemoved((ids) => [...ids, photo.id])} />
            </div>
          ))}
          {newPhotos.map((photo, index) => (
            <div key={photo.preview} className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-2xl bg-line">
              <img src={photo.preview} alt="" className="size-full object-cover" />
              <RemoveButton onClick={() => removeNew(index)} />
            </div>
          ))}
        </div>
        <input
          ref={fileInput}
          type="file"
          name="photoInput"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <Field label="Name">
        <input name="title" required defaultValue={recipe?.title} placeholder="z. B. Lisas Ofengemüse" className={inputClass} />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Kategorie">
          <select name="category" defaultValue={recipe?.category ?? DEFAULT_CATEGORY} className={`${inputClass} appearance-none`}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Minuten">
          <input name="minutes" type="number" inputMode="numeric" min={1} defaultValue={recipe?.minutes ?? ""} className={inputClass} />
        </Field>
        <Field label="Portionen">
          <input name="servings" type="number" inputMode="numeric" min={1} defaultValue={recipe?.servings ?? ""} className={inputClass} />
        </Field>
      </div>

      <Field label="Beschreibung" hint="optional">
        <textarea
          name="description"
          rows={2}
          defaultValue={recipe?.description ?? ""}
          placeholder="Was macht das Gericht aus?"
          className={inputClass}
        />
      </Field>

      <section>
        <h2 className="mb-1.5 text-sm font-medium">Zutaten</h2>
        <ListInput
          name="ingredients"
          initial={toLines(recipe?.ingredients)}
          placeholder="z. B. 500 g Kartoffeln"
          addLabel="Zutat hinzufügen"
        />
      </section>

      <section>
        <h2 className="mb-1.5 text-sm font-medium">Zubereitung</h2>
        <ListInput
          name="steps"
          initial={toLines(recipe?.steps)}
          placeholder="z. B. Ofen auf 200 °C vorheizen."
          addLabel="Schritt hinzufügen"
          numbered
        />
      </section>

      <Field label="Zuletzt gekocht" hint="leer lassen = TODO">
        <input
          name="lastCookedOn"
          type="date"
          max={todayBerlin()}
          defaultValue={recipe?.lastCookedOn ?? ""}
          className={`${inputClass} min-h-12`}
        />
      </Field>

      <Field label="Link zum Original" hint="optional">
        <input
          name="sourceUrl"
          type="url"
          inputMode="url"
          defaultValue={recipe?.sourceUrl ?? ""}
          placeholder="https://…"
          className={inputClass}
        />
      </Field>

      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3.5 font-semibold text-accent-ink transition-opacity disabled:opacity-80"
      >
        {pending && <LoaderCircle className="size-5 animate-spin" />}
        {pending ? stage : recipe ? "Änderungen speichern" : "Rezept speichern"}
      </button>
    </form>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Foto entfernen"
      className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white"
    >
      <X className="size-4" />
    </button>
  );
}
