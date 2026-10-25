import Image from "next/image";
import Link from "next/link";
import { ChefHat } from "lucide-react";
import { formatScore, ScorePills } from "@/components/score";
import { StatsCategoryFilter } from "@/components/stats-category-filter";
import { PEOPLE, PERSON_IDS } from "@/lib/people";
import { CATEGORIES } from "@/lib/categories";
import { averageScore, listRecipes, type RecipeSummary } from "@/lib/recipes";

export const metadata = { title: "Statistik · Unser Kochbuch" };

function mean(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

export default async function StatsPage({ searchParams }: PageProps<"/statistik">) {
  const { kat: katParam } = await searchParams;
  const kat = typeof katParam === "string" && (CATEGORIES as readonly string[]).includes(katParam) ? katParam : "";
  const recipes = await listRecipes();

  if (recipes.length === 0) {
    return <p className="py-20 text-center text-muted">Sobald ihr Rezepte eintragt, gibt&apos;s hier Statistiken.</p>;
  }

  const personAverages = PERSON_IDS.map((p) => ({
    person: p,
    average: mean(recipes.flatMap((r) => (r.scores[p] ? [r.scores[p]!] : []))),
  }));

  const bothRated = recipes.filter((r) => PERSON_IDS.every((p) => r.scores[p]));

  const topTogether = bothRated
    .filter((r) => !kat || r.category === kat)
    .sort((a, b) => averageScore(b.scores)! - averageScore(a.scores)!)
    .slice(0, 5)
    .map((r) => ({ recipe: r, label: `${formatScore(averageScore(r.scores)!)}/10` }));

  const disagreements = bothRated
    .map((r) => ({ recipe: r, diff: Math.abs(r.scores.benny! - r.scores.lisa!) }))
    .filter((d) => d.diff >= 2)
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 3)
    .map(({ recipe, diff }) => ({ recipe, label: `${diff} Punkte` }));

  const perCategory = CATEGORIES.map((category) => ({
    category,
    count: recipes.filter((r) => r.category === category).length,
  })).filter((c) => c.count > 0);
  const maxPerCategory = Math.max(1, ...perCategory.map((c) => c.count));
  const unrated = recipes.filter((r) => PERSON_IDS.some((p) => !r.scores[p])).length;

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl font-semibold">Statistik</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Rezepte" value={String(recipes.length)} />
        <Tile label="Noch zu bewerten" value={String(unrated)} />
        {personAverages.map(({ person, average }) => (
          <Tile
            key={person}
            label={`Ø ${PEOPLE[person].name}`}
            value={average === null ? "–" : formatScore(Math.round(average * 10) / 10)}
            suffix={average === null ? undefined : "/10"}
            valueClass={PEOPLE[person].text}
          />
        ))}
      </div>

      <RankList
        title="Eure Top 5"
        action={<StatsCategoryFilter value={kat} />}
        empty={
          kat
            ? `Noch kein ${kat}, das ihr beide bewertet habt.`
            : "Bewertet Rezepte beide, dann taucht hier eure Bestenliste auf."
        }
        items={topTogether}
      />
      {disagreements.length > 0 && (
        <RankList title="Hier seid ihr euch uneinig" items={disagreements} showScores />
      )}
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">Nach Kategorie</h2>
        <ul className="space-y-2.5 rounded-3xl border border-line bg-surface p-4">
          {perCategory.map(({ category, count }) => (
            <li key={category} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-3 text-sm">
              <span className="truncate">{category}</span>
              <span className="h-2 overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{ width: `${(count / maxPerCategory) * 100}%` }}
                />
              </span>
              <span className="text-right font-semibold tabular-nums">{count}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  suffix,
  valueClass = "",
}: {
  label: string;
  value: string;
  suffix?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className={`font-display text-4xl font-semibold tabular-nums ${valueClass}`}>
        {value}
        {suffix && <span className="text-base text-muted">{suffix}</span>}
      </p>
    </div>
  );
}

function RankList({
  title,
  action,
  items,
  empty,
  showScores = false,
}: {
  title: string;
  action?: React.ReactNode;
  items: { recipe: RecipeSummary; label: string }[];
  empty?: string;
  showScores?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        {action}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ol className="divide-y divide-line rounded-3xl border border-line bg-surface">
          {items.map(({ recipe, label }, index) => (
            <li key={recipe.id}>
              <Link href={`/rezepte/${recipe.id}`} className="flex items-center gap-3 p-3">
                <span className="w-5 text-center text-sm font-semibold text-muted tabular-nums">{index + 1}</span>
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-line">
                  {recipe.cover ? (
                    <Image src={recipe.cover} alt="" fill sizes="48px" className="object-cover" />
                  ) : (
                    <ChefHat className="m-auto mt-3 size-6 text-muted/60" strokeWidth={1.4} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{recipe.title}</p>
                  {showScores && <ScorePills scores={recipe.scores} />}
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">{label}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
