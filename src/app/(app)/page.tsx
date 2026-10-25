import { ChefHat, Plus } from "lucide-react";
import Link from "next/link";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeFilters } from "@/components/recipe-filters";
import { averageScore, listRecipes, type RecipeSummary } from "@/lib/recipes";
import { SORTS, type Sort } from "@/lib/sorts";

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

const byDesc = (a: number | null | undefined, b: number | null | undefined) => (b ?? -1) - (a ?? -1);

const sorters: Record<Sort, (a: RecipeSummary, b: RecipeSummary) => number> = {
  beste: (a, b) => byDesc(averageScore(a.scores), averageScore(b.scores)),
  benny: (a, b) => byDesc(a.scores.benny, b.scores.benny),
  lisa: (a, b) => byDesc(a.scores.lisa, b.scores.lisa),
  neu: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  az: (a, b) => a.title.localeCompare(b.title, "de"),
};

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const q = first(params.q);
  const kat = first(params.kat);
  const sortParam = first(params.sort);
  const sort: Sort = sortParam in SORTS ? (sortParam as Sort) : "neu";

  const all = await listRecipes();

  const needle = q.toLowerCase();
  const recipes = all
    .filter((r) => !needle || `${r.title}\n${r.ingredients}\n${r.description ?? ""}`.toLowerCase().includes(needle))
    .filter((r) => !kat || (kat === "todo" ? !r.lastCookedOn : r.category === kat))
    .sort(sorters[sort]);

  if (all.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-3xl bg-accent/10 text-accent">
          <ChefHat className="size-8" strokeWidth={1.6} />
        </div>
        <h1 className="font-display text-2xl font-semibold">Noch leer hier</h1>
        <p className="mt-2 max-w-xs text-muted">
          Leg euer erstes Rezept an, am besten gleich mit Foto.
        </p>
        <Link
          href="/rezepte/neu"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink"
        >
          <Plus className="size-5" />
          Erstes Rezept anlegen
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RecipeFilters q={q} kat={kat} sort={sort} />

      <p className="text-sm text-muted">
        {recipes.length === all.length
          ? `${all.length} ${all.length === 1 ? "Rezept" : "Rezepte"}`
          : `${recipes.length} von ${all.length} Rezepten`}
      </p>

      {recipes.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-muted">Nichts gefunden.</p>
      )}
    </div>
  );
}
