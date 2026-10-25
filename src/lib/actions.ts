"use server";

import { del, put } from "@vercel/blob";
import { and, eq, inArray, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logActivity, markSeen, recipeTitle, unreadFor } from "./activity";
import { requirePerson } from "./auth";
import { getDb } from "./db";
import { photos, ratings, recipes } from "./db/schema";
import { CATEGORIES, DEFAULT_CATEGORY } from "./categories";
import { averageScore, listRecipes } from "./recipes";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData: FormData, key: string) {
  return text(formData, key) || null;
}

function optionalDate(formData: FormData, key: string) {
  const value = text(formData, key);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function optionalInt(formData: FormData, key: string) {
  const value = Number.parseInt(text(formData, key), 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function refresh() {
  revalidatePath("/", "layout");
}

/** Legt ein Rezept an oder aktualisiert es (inkl. Fotos). */
export async function saveRecipe(formData: FormData): Promise<{ error: string } | { id: number }> {
  const person = await requirePerson();
  const db = getDb();

  const id = optionalInt(formData, "id");
  const title = text(formData, "title");
  if (!title) return { error: "Bitte gib dem Rezept einen Namen." };

  const category = text(formData, "category");
  const values = {
    title,
    category: (CATEGORIES as readonly string[]).includes(category) ? category : DEFAULT_CATEGORY,
    description: optionalText(formData, "description"),
    ingredients: text(formData, "ingredients"),
    steps: text(formData, "steps"),
    minutes: optionalInt(formData, "minutes"),
    servings: optionalInt(formData, "servings"),
    sourceUrl: optionalText(formData, "sourceUrl"),
    lastCookedOn: optionalDate(formData, "lastCookedOn"),
  };

  let recipeId: number;
  if (id) {
    const updated = await db.update(recipes).set(values).where(eq(recipes.id, id)).returning({ id: recipes.id });
    if (!updated.length) return { error: "Rezept nicht gefunden." };
    recipeId = id;
  } else {
    const [created] = await db
      .insert(recipes)
      .values({ ...values, createdBy: person })
      .returning({ id: recipes.id });
    recipeId = created.id;
  }

  // Entfernte Fotos löschen
  const removeIds = formData
    .getAll("removePhoto")
    .map((value) => Number(value))
    .filter(Number.isInteger);
  if (removeIds.length) {
    const removed = await db
      .delete(photos)
      .where(and(eq(photos.recipeId, recipeId), inArray(photos.id, removeIds)))
      .returning({ url: photos.url });
    if (removed.length) await del(removed.map((photo) => photo.url));
  }

  // Neue Fotos hochladen (kommen bereits verkleinert aus dem Browser)
  const files = formData.getAll("photos").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length) {
    const [{ last }] = await db
      .select({ last: max(photos.position) })
      .from(photos)
      .where(eq(photos.recipeId, recipeId));
    let position = (last ?? -1) + 1;

    const uploaded = await Promise.all(
      files.map((file) =>
        put(`rezepte/${recipeId}/${crypto.randomUUID()}.jpg`, file, {
          access: "public",
          contentType: file.type || "image/jpeg",
        }),
      ),
    );
    await db.insert(photos).values(uploaded.map((blob) => ({ recipeId, url: blob.url, position: position++ })));
  }

  if (!id) {
    await logActivity(person, "recipe_created", recipeId, { title, count: files.length });
  } else if (files.length) {
    await logActivity(person, "photos_added", recipeId, { title, count: files.length });
  }

  refresh();
  return { id: recipeId };
}

export async function deleteRecipe(id: number) {
  await requirePerson();
  const db = getDb();
  const photoRows = await db.select({ url: photos.url }).from(photos).where(eq(photos.recipeId, id));
  await db.delete(recipes).where(eq(recipes.id, id));
  if (photoRows.length) await del(photoRows.map((photo) => photo.url));
  refresh();
}

/** Bewertung der eingeloggten Person setzen (1–10). */
export async function rateRecipe(recipeId: number, score: number) {
  const person = await requirePerson();
  if (!Number.isInteger(score) || score < 1 || score > 10) return;
  await getDb()
    .insert(ratings)
    .values({ recipeId, person, score })
    .onConflictDoUpdate({
      target: [ratings.recipeId, ratings.person],
      set: { score, updatedAt: new Date() },
    });
  await logActivity(person, "rated", recipeId, { title: await recipeTitle(recipeId), score });
  refresh();
}

export async function saveRatingComment(recipeId: number, formData: FormData) {
  const person = await requirePerson();
  const comment = optionalText(formData, "comment");
  const [previous] = await getDb()
    .update(ratings)
    .set({ comment, updatedAt: new Date() })
    .where(and(eq(ratings.recipeId, recipeId), eq(ratings.person, person)))
    .returning({ id: ratings.recipeId });
  if (previous && comment) {
    await logActivity(person, "commented", recipeId, { title: await recipeTitle(recipeId), comment });
  }
  refresh();
}

/**
 * "Was kochen wir heute?" – ein zufälliges Rezept der gewählten Kategorie (leer = egal),
 * bevorzugt eins, das euch geschmeckt hat.
 */
export async function pickRandomRecipe(category: string, excludeId?: number) {
  await requirePerson();
  const all = (await listRecipes()).filter((r) => r.id !== excludeId && (!category || r.category === category));
  const good = all.filter((r) => (averageScore(r.scores) ?? 7) >= 6);
  const pool = good.length ? good : all;
  if (pool.length === 0) return null;

  const pick = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: pick.id,
    title: pick.title,
    category: pick.category,
    cover: pick.cover,
    scores: pick.scores,
    minutes: pick.minutes,
    canReroll: all.length > 1,
  };
}

/** Für das Live-Popup: neue Aktivitäten der anderen Person seit `afterId`. */
export async function fetchNewActivity(afterId: number) {
  const person = await requirePerson();
  return unreadFor(person, afterId);
}

export async function markActivitySeen(uptoId: number) {
  const person = await requirePerson();
  if (Number.isInteger(uptoId) && uptoId > 0) await markSeen(person, uptoId);
}
