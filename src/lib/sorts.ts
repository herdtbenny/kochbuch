export const SORTS = {
  neu: "Neu hinzugefügt",
  beste: "Beste Bewertung",
  benny: "Bennys Favoriten",
  lisa: "Lisas Favoriten",
  az: "A–Z",
} as const;

export type Sort = keyof typeof SORTS;
