export const SORTS = {
  zuletzt: "Zuletzt gekocht",
  beste: "Beste Bewertung",
  benny: "Bennys Favoriten",
  lisa: "Lisas Favoriten",
  oft: "Am häufigsten",
  neu: "Neu hinzugefügt",
  az: "A–Z",
} as const;

export type Sort = keyof typeof SORTS;
