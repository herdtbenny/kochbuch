"use client";

import { ArrowRight, ChefHat, Clock, Dices, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { pickRandomRecipe } from "@/lib/actions";
import { relativeDay } from "@/lib/dates";
import { ScorePills } from "./score";

type Pick = Awaited<ReturnType<typeof pickRandomRecipe>>;

/** Popup "Was kochen wir heute?" – der Auslöser sitzt in der Navigation. */
export function RandomRecipeDialog({ triggerClass }: { triggerClass: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pick, setPick] = useState<Pick | undefined>(undefined);
  const [pending, startTransition] = useTransition();

  function roll(excludeId?: number) {
    startTransition(async () => {
      setPick(await pickRandomRecipe(excludeId));
    });
  }

  function open() {
    dialog.current?.showModal();
    roll();
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
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-xl font-semibold">Wie wär&apos;s damit?</p>
            <button
              type="button"
              onClick={close}
              aria-label="Schließen"
              className="flex size-8 items-center justify-center rounded-full bg-paper text-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          {pick === null ? (
            <p className="py-10 text-center text-muted">Legt erst ein paar Rezepte an, dann wird gewürfelt.</p>
          ) : (
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
                      <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
                        <span>
                          {pick.lastCooked
                            ? `${pick.cookCount}× gekocht · zuletzt ${relativeDay(pick.lastCooked, pick.today)}`
                            : "Noch nie gekocht"}
                        </span>
                        {pick.minutes && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {pick.minutes} Min.
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </div>
              </Link>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => roll(pick?.id)}
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
