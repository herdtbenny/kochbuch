"use server";

import { del, put } from "@vercel/blob";
import { and, eq, inArray, max, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logActivity, markSeen, recipeTitle, unreadFor } from "./activity";
import { requirePerson } from "./auth";
import { todayBerlin } from "./format-date";
import { getDb } from "./db";
import { photos, pushSubscriptions, ratings, recipes } from "./db/schema";
import { CATEGORIES, DEFAULT_CATEGORY } from "./categories";
import { pushToPerson } from "./push";
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
    todo: formData.get("todo") === "on",
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

/** Gemeinsame Notizen zum Rezept speichern. */
export async function saveNotes(recipeId: number, notes: string) {
  const person = await requirePerson();
  const value = notes.trim() || null;
  const [updated] = await getDb()
    .update(recipes)
    .set({ notes: value })
    .where(eq(recipes.id, recipeId))
    .returning({ title: recipes.title });
  if (!updated) throw new Error("Rezept nicht gefunden");
  if (value) await logActivity(person, "commented", recipeId, { title: updated.title, comment: value });
  refresh();
}

/** TODO-Schalter setzen oder entfernen. TODO an nimmt ein „heute gekocht“ wieder raus. */
export async function setTodo(recipeId: number, todo: boolean) {
  await requirePerson();
  await getDb()
    .update(recipes)
    .set(
      todo
        ? {
            todo,
            lastCookedOn: sql`case when ${recipes.lastCookedOn} = ${todayBerlin()} then null else ${recipes.lastCookedOn} end`,
          }
        : { todo },
    )
    .where(eq(recipes.id, recipeId));
  refresh();
}

/** "Heute gekocht": setzt das Datum auf heute (deutsche Zeit) und erledigt ein TODO. */
export async function markCookedToday(recipeId: number) {
  const person = await requirePerson();
  const [updated] = await getDb()
    .update(recipes)
    .set({ lastCookedOn: todayBerlin(), todo: false })
    .where(eq(recipes.id, recipeId))
    .returning({ title: recipes.title });
  if (!updated) throw new Error("Rezept nicht gefunden");
  await logActivity(person, "cooked", recipeId, { title: updated.title });
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

type PushSubscriptionInput = { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

/** Push-Abo dieses Geräts speichern (für die eingeloggte Person). */
export async function savePushSubscription(subscription: PushSubscriptionInput) {
  const person = await requirePerson();
  const { endpoint, keys } = subscription;
  if (!endpoint?.startsWith("https://") || !keys?.p256dh || !keys.auth) throw new Error("Ungültiges Push-Abo");
  await getDb()
    .insert(pushSubscriptions)
    .values({ endpoint, person, p256dh: keys.p256dh, auth: keys.auth })
    .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { person, p256dh: keys.p256dh, auth: keys.auth } });
}

export async function removePushSubscription(endpoint: string) {
  await requirePerson();
  await getDb().delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function sendTestPush() {
  const person = await requirePerson();
  await pushToPerson(person, {
    title: "Unser Kochbuch",
    body: "Push-Benachrichtigungen funktionieren.",
    url: "/aktivitaet",
  });
}
