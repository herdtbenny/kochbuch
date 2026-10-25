import { date, integer, jsonb, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";
import type { ActivityMeta } from "../activity-format";

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  /** Eine Zutat pro Zeile */
  ingredients: text("ingredients").notNull().default(""),
  /** Ein Schritt pro Zeile */
  steps: text("steps").notNull().default(""),
  servings: integer("servings"),
  minutes: integer("minutes"),
  sourceUrl: text("source_url"),
  /** Gemeinsame Notizen von Benny & Lisa */
  notes: text("notes"),
  /** Von Hand gepflegt; leer = noch nie gekocht (TODO) */
  lastCookedOn: date("last_cooked_on", { mode: "string" }),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Eine Bewertung (1–10) pro Person und Rezept */
export const ratings = pgTable(
  "ratings",
  {
    recipeId: integer("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    person: text("person").notNull(),
    score: integer("score").notNull(),
    /** Früher persönlicher Kommentar – ersetzt durch gemeinsame Notizen am Rezept */
    comment: text("comment"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.recipeId, t.person] })],
);

/** Früheres Kochtagebuch – wird nicht mehr benutzt, Tabelle bleibt nur wegen vorhandener Daten */
export const cooks = pgTable("cooks", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  cookedOn: date("cooked_on", { mode: "string" }).notNull(),
  note: text("note"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Was Benny oder Lisa gemacht hat – für Benachrichtigungen und den Rückblick */
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  actor: text("actor").notNull(),
  type: text("type").notNull(),
  recipeId: integer("recipe_id").references(() => recipes.id, { onDelete: "set null" }),
  /** Titel wird mitgespeichert, damit der Eintrag auch nach dem Löschen lesbar bleibt */
  meta: jsonb("meta").$type<ActivityMeta>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Bis zu welcher Aktivität jemand alles gesehen hat */
export const activityReads = pgTable("activity_reads", {
  person: text("person").primaryKey(),
  lastSeenId: integer("last_seen_id").notNull().default(0),
});

/** Push-Abos pro Gerät (ein Endpoint = ein Browser/Homescreen-App) */
export const pushSubscriptions = pgTable("push_subscriptions", {
  endpoint: text("endpoint").primaryKey(),
  person: text("person").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
