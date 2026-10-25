import Image from "next/image";
import Link from "next/link";
import { ChefHat } from "lucide-react";
import { formatScore, ScorePills } from "@/components/score";
import { daysBetween, relativeDay, todayBerlin } from "@/lib/dates";
import { PEOPLE, PERSON_IDS } from "@/lib/people";
import { averageScore, listCookDates, listRecipes, type RecipeSummary } from "@/lib/recipes";

export const metadata = { title: "Statistik · Unser Kochbuch" };

function mean(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

/** Die letzten 12 Monate als "YYYY-MM", ältester zuerst */
function lastMonths(today: string, count = 12) {
  const [year, month] = today.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 1 - (count - 1 - i), 1));
    return d.toISOString().slice(0, 7);
  });
}

export default async function StatsPage() {
  const [recipes, cookDates] = await Promise.all([listRecipes(), listCookDates()]);
  const today = todayBerlin();

  if (recipes.length === 0) {
    return <p className="py-20 text-center text-muted">Sobald ihr Rezepte eintragt, gibt&apos;s hier Statistiken.</p>;
  }

  const personAverages = PERSON_IDS.map((p) => ({
    person: p,
    average: mean(recipes.flatMap((r) => (r.scores[p] ? [r.scores[p]!] : []))),
  }));

  const bothRated = recipes.filter((r) => PERSON_IDS.every((p) => r.scores[p]));

  const topTogether = [...bothRated]
    .sort((a, b) => averageScore(b.scores)! - averageScore(a.scores)!)
    .slice(0, 5)
    .map((r) => ({ recipe: r, label: `${formatScore(averageScore(r.scores)!)} / 10` }));

  const disagreements = bothRated
    .map((r) => ({ recipe: r, diff: Math.abs(r.scores.benny! - r.scores.lisa!) }))
    .filter((d) => d.diff >= 2)
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 3)
    .map(({ recipe, diff }) => ({ recipe, label: `${diff} Punkte` }));

  const mostCooked = recipes
    .filter((r) => r.cookCount > 0)
    .sort((a, b) => b.cookCount - a.cookCount)
    .slice(0, 5)
    .map((r) => ({ recipe: r, label: `${r.cookCount}×` }));

  const forgotten = recipes
    .filter((r) => (averageScore(r.scores) ?? 0) >= 7 && r.lastCooked && daysBetween(r.lastCooked, today) >= 60)
    .sort((a, b) => a.lastCooked!.localeCompare(b.lastCooked!))
    .slice(0, 5)
    .map((r) => ({ recipe: r, label: relativeDay(r.lastCooked!, today) }));

  const months = lastMonths(today);
  const perMonth = months.map((key) => ({
    key,
    count: cookDates.filter((c) => c.cookedOn.startsWith(key)).length,
  }));
  const maxPerMonth = Math.max(1, ...perMonth.map((m) => m.count));
  const monthName = (key: string, style: "short" | "long") =>
    new Intl.DateTimeFormat("de-DE", { month: style, year: style === "long" ? "numeric" : undefined, timeZone: "UTC" }).format(
      new Date(`${key}-01`),
    );

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl font-semibold">Statistik</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Rezepte" value={String(recipes.length)} />
        <Tile label="Mal gekocht" value={String(cookDates.length)} />
        {personAverages.map(({ person, average }) => (
          <Tile
            key={person}
            label={`Ø ${PEOPLE[person].name}`}
            value={average === null ? "–" : formatScore(Math.round(average * 10) / 10)}
            valueClass={PEOPLE[person].text}
          />
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Gekocht pro Monat</h2>
        <div className="rounded-3xl border border-line bg-surface p-4">
          <div className="flex h-40 items-end gap-1.5">
            {perMonth.map((m) => (
              <div key={m.key} className="group relative flex h-full flex-1 flex-col justify-end">
                <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-2 py-1 text-xs whitespace-nowrap text-paper opacity-0 transition-opacity group-hover:opacity-100">
                  {monthName(m.key, "long")}: {m.count}×
                </span>
                <div
                  role="img"
                  aria-label={`${monthName(m.key, "long")}: ${m.count}× gekocht`}
                  className={`w-full rounded-t-[4px] ${m.count ? "bg-accent" : "bg-line"}`}
                  style={{ height: m.count ? `${(m.count / maxPerMonth) * 100}%` : "2px" }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1.5 border-t border-line pt-2">
            {perMonth.map((m) => (
              <span key={m.key} className="flex-1 text-center text-[10px] text-muted">
                {monthName(m.key, "short").slice(0, 3)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <RankList title="Eure Top 5" empty="Bewertet Rezepte beide, dann taucht hier eure Bestenliste auf." items={topTogether} />
      <RankList title="Am häufigsten gekocht" empty="Noch nichts gekocht." items={mostCooked} />
      {disagreements.length > 0 && (
        <RankList title="Hier seid ihr euch uneinig" items={disagreements} showScores />
      )}
      {forgotten.length > 0 && <RankList title="Lange nicht mehr gekocht" items={forgotten} />}
    </div>
  );
}

function Tile({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className={`font-display text-4xl font-semibold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}

function RankList({
  title,
  items,
  empty,
  showScores = false,
}: {
  title: string;
  items: { recipe: RecipeSummary; label: string }[];
  empty?: string;
  showScores?: boolean;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
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
