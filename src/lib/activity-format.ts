import { PEOPLE, type Person } from "./people";

// Typen und Texte für Aktivitäten – ohne DB-Import, damit auch Client-Komponenten sie nutzen können.

export type ActivityType = "recipe_created" | "photos_added" | "rated" | "commented" | "cooked";

export type ActivityMeta = {
  title: string;
  score?: number;
  count?: number;
  comment?: string;
};

export type ActivityItem = {
  id: number;
  actor: Person;
  type: ActivityType;
  recipeId: number | null;
  meta: ActivityMeta;
  createdAt: string;
};

export type UnreadActivity = { items: ActivityItem[]; unread: number };

function photosPhrase(count: number) {
  return count === 1 ? "ein Foto" : `${count} Fotos`;
}

export function describeActivity({ actor, type, meta }: ActivityItem) {
  const name = PEOPLE[actor].name;
  const title = `„${meta.title}“`;
  switch (type) {
    case "recipe_created":
      return meta.count
        ? `${name} hat ${title} angelegt, mit ${photosPhrase(meta.count).replace("ein Foto", "einem Foto")}`
        : `${name} hat ${title} angelegt`;
    case "photos_added":
      return `${name} hat ${photosPhrase(meta.count ?? 1)} zu ${title} hochgeladen`;
    case "rated":
      return `${name} hat ${title} mit ${meta.score}/10 bewertet`;
    case "commented":
      return `${name} hat ${title} kommentiert: „${meta.comment}“`;
    case "cooked": // nur noch alte Einträge
      return `${name} hat ${title} gekocht`;
  }
}

export function timeAgo(iso: string, now = Date.now()) {
  const minutes = Math.round((now - Date.parse(iso)) / 60_000);
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.round(hours / 24);
  if (days === 1) return "gestern";
  if (days < 7) return `vor ${days} Tagen`;
  return new Date(iso).toLocaleDateString("de-DE", { day: "numeric", month: "short", timeZone: "Europe/Berlin" });
}
