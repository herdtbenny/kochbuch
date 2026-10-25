import { asc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { photos, ratings, recipes } from "./db/schema";
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
  const [recipeRows, photoRows, ratingRows] = await Promise.all([
    db.select().from(recipes),
    db
      .select({ recipeId: photos.recipeId, url: photos.url })
      .from(photos)
      .orderBy(asc(photos.position), asc(photos.id)),
    db.select().from(ratings),
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
  }));
}

export async function getRecipe(id: number) {
  if (!Number.isInteger(id)) return null;
  const db = getDb();
  const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
  if (!recipe) return null;

  const [photoRows, ratingRows] = await Promise.all([
    db.select().from(photos).where(eq(photos.recipeId, id)).orderBy(asc(photos.position), asc(photos.id)),
    db.select().from(ratings).where(eq(ratings.recipeId, id)),
  ]);

  const personRatings: Partial<Record<Person, { score: number; comment: string | null }>> = {};
  for (const rating of ratingRows) {
    if (isPerson(rating.person)) personRatings[rating.person] = { score: rating.score, comment: rating.comment };
  }

  return { ...recipe, photos: photoRows, ratings: personRatings };
}

export type RecipeDetail = NonNullable<Awaited<ReturnType<typeof getRecipe>>>;
