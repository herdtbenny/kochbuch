import { ChefHat, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { relativeDay } from "@/lib/dates";
import type { RecipeSummary } from "@/lib/recipes";
import { ScorePills } from "./score";

/** Listeneintrag: Foto links, Infos rechts */
export function RecipeCard({ recipe, today }: { recipe: RecipeSummary; today: string }) {
  return (
    <Link
      href={`/rezepte/${recipe.id}`}
      className="group flex items-center gap-4 rounded-3xl border border-line bg-surface p-2.5 pr-4"
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-line sm:size-28">
        {recipe.cover ? (
          <Image
            src={recipe.cover}
            alt=""
            fill
            sizes="112px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted/60">
            <ChefHat className="size-8" strokeWidth={1.4} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-xs font-medium text-accent">{recipe.category}</p>
        <h2 className="line-clamp-2 font-display text-lg leading-snug font-semibold">{recipe.title}</h2>
        <ScorePills scores={recipe.scores} />
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
          {recipe.lastCooked ? (
            <span>
              {recipe.cookCount}× gekocht · {relativeDay(recipe.lastCooked, today)}
            </span>
          ) : (
            <span>Noch nie gekocht</span>
          )}
          {recipe.minutes && (
            <span className="inline-flex items-center gap-0.5">
              <Clock className="size-3" />
              {recipe.minutes} Min.
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
