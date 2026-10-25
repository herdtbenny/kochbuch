import { NextResponse, type NextRequest } from "next/server";
import { daysBetween, todayBerlin } from "@/lib/dates";
import { averageScore, listRecipes } from "@/lib/recipes";

/**
 * "Was kochen wir heute?" – ein zufälliges Rezept, das gut ankam (oder noch unbewertet ist)
 * und in den letzten zwei Wochen nicht auf dem Tisch stand.
 */
export async function GET(request: NextRequest) {
  const exclude = Number(request.nextUrl.searchParams.get("nicht"));
  const today = todayBerlin();
  const all = (await listRecipes()).filter((r) => r.id !== exclude);

  const good = all.filter(
    (r) => (averageScore(r.scores) ?? 7) >= 6 && (!r.lastCooked || daysBetween(r.lastCooked, today) >= 14),
  );
  const pool = good.length ? good : all;

  if (pool.length === 0) {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }

  const pick = pool[Math.floor(Math.random() * pool.length)];
  return NextResponse.redirect(new URL(`/rezepte/${pick.id}?zufall`, request.url), 303);
}
