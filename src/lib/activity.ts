import { and, count, desc, eq, gt, ne, sql } from "drizzle-orm";
import { after } from "next/server";
import {
  describeActivity,
  type ActivityItem,
  type ActivityMeta,
  type ActivityType,
  type UnreadActivity,
} from "./activity-format";
import { getDb } from "./db";
import { activities, activityReads, recipes } from "./db/schema";
import { isPerson, otherPerson, type Person } from "./people";
import { pushToPerson } from "./push";

type ActivityRow = typeof activities.$inferSelect;

function toItem(row: ActivityRow): ActivityItem | null {
  if (!isPerson(row.actor)) return null;
  return {
    id: row.id,
    actor: row.actor,
    type: row.type as ActivityType,
    recipeId: row.recipeId,
    meta: row.meta,
    createdAt: row.createdAt.toISOString(),
  };
}

const toItems = (rows: ActivityRow[]) => rows.map(toItem).filter((item) => item !== null);

export async function recipeTitle(recipeId: number) {
  const [row] = await getDb().select({ title: recipes.title }).from(recipes).where(eq(recipes.id, recipeId));
  return row?.title ?? "Rezept";
}

export async function logActivity(actor: Person, type: ActivityType, recipeId: number, meta: ActivityMeta) {
  const db = getDb();
  let replaced = false;
  if (type === "rated") {
    // Mehrfaches Umbewerten innerhalb kurzer Zeit nur einmal melden
    const removed = await db
      .delete(activities)
      .where(
        and(
          eq(activities.actor, actor),
          eq(activities.type, "rated"),
          eq(activities.recipeId, recipeId),
          gt(activities.createdAt, new Date(Date.now() - 10 * 60_000)),
        ),
      )
      .returning({ id: activities.id });
    replaced = removed.length > 0;
  }
  const [row] = await db.insert(activities).values({ actor, type, recipeId, meta }).returning();

  // Push an die andere Person – nach der Antwort, damit das Speichern nicht wartet
  const item = toItem(row);
  if (item && !replaced) {
    after(() =>
      pushToPerson(otherPerson(actor), {
        title: "Unser Kochbuch",
        body: describeActivity(item),
        url: `/rezepte/${recipeId}`,
      }),
    );
  }
}

async function lastSeenId(person: Person) {
  const [row] = await getDb().select().from(activityReads).where(eq(activityReads.person, person));
  return row?.lastSeenId ?? 0;
}

/** Ungelesene Aktivitäten der anderen Person (neueste zuerst), optional nur nach `afterId`. */
export async function unreadFor(person: Person, afterId = 0): Promise<UnreadActivity> {
  const db = getDb();
  const seen = await lastSeenId(person);
  const fromOthers = ne(activities.actor, person);

  const [rows, [{ unread }]] = await Promise.all([
    db
      .select()
      .from(activities)
      .where(and(fromOthers, gt(activities.id, Math.max(seen, afterId))))
      .orderBy(desc(activities.id))
      .limit(30),
    db
      .select({ unread: count() })
      .from(activities)
      .where(and(fromOthers, gt(activities.id, seen))),
  ]);

  return { items: toItems(rows), unread };
}

export async function recentActivity(limit = 80) {
  const rows = await getDb().select().from(activities).orderBy(desc(activities.id)).limit(limit);
  return toItems(rows);
}

export async function markSeen(person: Person, uptoId: number) {
  await getDb()
    .insert(activityReads)
    .values({ person, lastSeenId: uptoId })
    .onConflictDoUpdate({
      target: activityReads.person,
      set: { lastSeenId: sql`greatest(${activityReads.lastSeenId}, ${uptoId})` },
    });
}
