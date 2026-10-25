import { date, integer, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";

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
    comment: text("comment"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.recipeId, t.person] })],
);

/** Jedes Mal, wenn ein Rezept gekocht wurde */
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
