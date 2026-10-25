"use client";

import { ArrowLeft, ArrowRight, ChefHat, Clock, Dices, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { pickRandomRecipe } from "@/lib/actions";
import { CATEGORIES } from "@/lib/categories";
import { ScorePills } from "./score";

type Pick = Awaited<ReturnType<typeof pickRandomRecipe>>;

/** Leerer String = Kategorie egal */
const ANY = "";

/**
 * Popup "Was kochen wir heute?": zuerst die Essensart wählen, dann ein Rezept daraus würfeln.
 * Der Auslöser sitzt in der Navigation.
 */
export function RandomRecipeDialog({ triggerClass }: { triggerClass: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [pick, setPick] = useState<Pick | undefined>(undefined);
  const [pending, startTransition] = useTransition();

  function roll(chosen: string, excludeId?: number) {
    setCategory(chosen);
    startTransition(async () => {
      setPick(await pickRandomRecipe(chosen, excludeId));
    });
  }

  function open() {
    setCategory(null);
    setPick(undefined);
    dialog.current?.showModal();
  }

  const close = () => dialog.current?.close();

  return (
    <>
      <button type="button" onClick={open} className={triggerClass}>
        <Dices className="size-5" />
        Zufall
      </button>

      <dialog
        ref={dialog}
        aria-label="Was kochen wir heute?"
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-[min(92vw,24rem)] rounded-3xl bg-surface text-ink shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            {category === null ? (
              <p className="font-display text-xl font-semibold">Worauf habt ihr Lust?</p>
            ) : (
              <button
                type="button"
                onClick={() => setCategory(null)}
                className="inline-flex items-center gap-1.5 rounded-full bg-paper py-1.5 pr-3.5 pl-2.5 text-sm font-medium"
              >
                <ArrowLeft className="size-4" />
                {category || "Egal"}
              </button>
            )}
            <button
              type="button"
              onClick={close}
              aria-label="Schließen"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-paper text-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          {category === null ? (
            /* Schritt 1: Essensart */
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => roll(c)}
                  className="rounded-full border border-line bg-paper px-4 py-3 font-medium transition-colors hover:border-accent"
                >
                  {c}
                </button>
              ))}
              <button
                type="button"
                onClick={() => roll(ANY)}
                className="col-span-2 flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 font-semibold text-accent-ink"
              >
                <Dices className="size-5" />
                Egal, überrascht uns
              </button>
            </div>
          ) : pick === null ? (
            /* Nichts in dieser Kategorie */
            <div className="space-y-4 py-6 text-center">
              <p className="text-muted">
                {category ? `Noch kein Rezept in „${category}“.` : "Legt erst ein paar Rezepte an, dann wird gewürfelt."}
              </p>
              <button
                type="button"
                onClick={() => setCategory(null)}
                className="rounded-full border border-line px-5 py-2.5 font-medium"
              >
                Andere Kategorie
              </button>
            </div>
          ) : (
            /* Schritt 2: Vorschlag */
            <div className={`transition-opacity ${pending ? "opacity-40" : ""}`} aria-busy={pending}>
              <Link href={pick ? `/rezepte/${pick.id}` : "#"} onClick={close} className="block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-line">
                  {pick?.cover ? (
                    <Image src={pick.cover} alt="" fill sizes="384px" className="object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted/60">
                      {pick ? <ChefHat className="size-10" strokeWidth={1.4} /> : <Dices className="size-10 animate-pulse" />}
                    </div>
                  )}
                </div>
                <div className="mt-3 min-h-24 space-y-1.5">
                  {pick && (
                    <>
                      <p className="text-sm font-medium text-accent">{pick.category}</p>
                      <h2 className="font-display text-2xl leading-tight font-semibold text-balance">{pick.title}</h2>
                      <ScorePills scores={pick.scores} />
                      {pick.minutes && (
                        <p className="inline-flex items-center gap-1 text-sm text-muted">
                          <Clock className="size-3.5" />
                          {pick.minutes} Min.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </Link>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => roll(category, pick?.id)}
                  disabled={pending || !pick?.canReroll}
                  className="flex items-center justify-center gap-2 rounded-full border border-line px-4 py-3 font-medium disabled:opacity-50"
                >
                  <Dices className="size-5" />
                  Nochmal
                </button>
                <Link
                  href={pick ? `/rezepte/${pick.id}` : "#"}
                  onClick={close}
                  aria-disabled={!pick}
                  className="flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 font-semibold text-accent-ink aria-disabled:pointer-events-none aria-disabled:opacity-50"
                >
                  Zum Rezept
                  <ArrowRight className="size-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
