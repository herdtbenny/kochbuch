import { ChefHat, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { relativeDay } from "@/lib/dates";
import type { RecipeSummary } from "@/lib/recipes";
import { ScorePills } from "./score";

export function RecipeCard({ recipe, today }: { recipe: RecipeSummary; today: string }) {
  return (
    <Link href={`/rezepte/${recipe.id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-line">
        {recipe.cover ? (
          <Image
            src={recipe.cover}
            alt=""
            fill
            sizes="(min-width: 768px) 360px, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted/60">
            <ChefHat className="size-10" strokeWidth={1.4} />
          </div>
        )}
        <span className="absolute top-2 left-2 rounded-full bg-surface/90 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur">
          {recipe.category}
        </span>
      </div>
      <div className="mt-2.5 space-y-1.5 px-0.5">
        <h2 className="font-display text-lg leading-snug font-semibold text-balance">{recipe.title}</h2>
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
