import { asc, count, desc, eq, max } from "drizzle-orm";
import { getDb } from "./db";
import { cooks, photos, ratings, recipes } from "./db/schema";
import { isPerson, type Person } from "./people";

export type Scores = Partial<Record<Person, number>>;

export type RecipeSummary = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  ingredients: string;
  minutes: number | null;
  createdAt: Date;
  cover: string | null;
  scores: Scores;
  cookCount: number;
  lastCooked: string | null;
};

/** Durchschnitt der vorhandenen Bewertungen, oder null */
export function averageScore(scores: Scores) {
  const values = Object.values(scores);
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

export function lines(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function listRecipes(): Promise<RecipeSummary[]> {
  const db = getDb();
  const [recipeRows, photoRows, ratingRows, cookRows] = await Promise.all([
    db.select().from(recipes),
    db
      .select({ recipeId: photos.recipeId, url: photos.url })
      .from(photos)
      .orderBy(asc(photos.position), asc(photos.id)),
    db.select().from(ratings),
    db
      .select({ recipeId: cooks.recipeId, count: count(), last: max(cooks.cookedOn) })
      .from(cooks)
      .groupBy(cooks.recipeId),
  ]);

  const covers = new Map<number, string>();
  for (const photo of photoRows) {
    if (!covers.has(photo.recipeId)) covers.set(photo.recipeId, photo.url);
  }

  const scores = new Map<number, Scores>();
  for (const rating of ratingRows) {
    if (!isPerson(rating.person)) continue;
    const entry = scores.get(rating.recipeId) ?? {};
    entry[rating.person] = rating.score;
    scores.set(rating.recipeId, entry);
  }

  const cookStats = new Map(cookRows.map((row) => [row.recipeId, row]));

  return recipeRows.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    category: recipe.category,
    ingredients: recipe.ingredients,
    minutes: recipe.minutes,
    createdAt: recipe.createdAt,
    cover: covers.get(recipe.id) ?? null,
    scores: scores.get(recipe.id) ?? {},
    cookCount: cookStats.get(recipe.id)?.count ?? 0,
    lastCooked: cookStats.get(recipe.id)?.last ?? null,
  }));
}

export async function getRecipe(id: number) {
  if (!Number.isInteger(id)) return null;
  const db = getDb();
  const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
  if (!recipe) return null;

  const [photoRows, ratingRows, cookRows] = await Promise.all([
    db.select().from(photos).where(eq(photos.recipeId, id)).orderBy(asc(photos.position), asc(photos.id)),
    db.select().from(ratings).where(eq(ratings.recipeId, id)),
    db.select().from(cooks).where(eq(cooks.recipeId, id)).orderBy(desc(cooks.cookedOn), desc(cooks.id)),
  ]);

  const personRatings: Partial<Record<Person, { score: number; comment: string | null }>> = {};
  for (const rating of ratingRows) {
    if (isPerson(rating.person)) personRatings[rating.person] = { score: rating.score, comment: rating.comment };
  }

  return { ...recipe, photos: photoRows, ratings: personRatings, cooks: cookRows };
}

export type RecipeDetail = NonNullable<Awaited<ReturnType<typeof getRecipe>>>;

export async function listCookDates() {
  return getDb().select({ cookedOn: cooks.cookedOn }).from(cooks);
}
