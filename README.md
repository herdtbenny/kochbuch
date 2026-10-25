# Unser Kochbuch

Ein gemeinsames Kochbuch für Benny & Lisa: Alles, was wir gekocht haben, mit Fotos, getrennten Bewertungen und einem Kochtagebuch. Läuft als Web-App und lässt sich auf dem iPhone über „Teilen → Zum Home-Bildschirm“ wie eine App installieren.

## Funktionen

- **Rezepte** mit Fotos (werden im Browser verkleinert), Kategorie, Zeit, Portionen, Zutaten, Zubereitung und Link zum Original
- **Zwei Bewertungen** (1–10): Jeder bewertet für sich, plus optionaler Kommentar
- **Kochtagebuch**: „Heute gekocht“ mit einem Tipp, oder mit Datum und Notiz nachtragen
- **Suche** nach Gericht oder Zutat („was machen wir mit der Zucchini?“), Filter nach Kategorie und „Noch nie gekocht“ (= Wunschliste), Sortierung nach Bewertung, Häufigkeit usw.
- **Zufall**: schlägt ein gut bewertetes Gericht vor, das länger nicht dran war
- **Statistik**: Durchschnittsbewertungen, Top 5, wo ihr euch uneinig seid, meistgekocht, lange nicht mehr gekocht, Kochen pro Monat
- **Zutaten abhaken** beim Einkaufen oder Kochen
- Login mit gemeinsamem Passwort + Auswahl „Benny“ oder „Lisa“

## Tech-Stack

Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS 4 · Drizzle ORM · Neon Postgres · Vercel Blob · Vercel

## Lokal starten

```bash
npm install
cp .env.example .env.local   # Werte eintragen (oder: vercel env pull .env.local)
npm run db:push              # Tabellen anlegen
npm run dev
```

## Umgebungsvariablen

| Variable | Wofür |
|---|---|
| `DATABASE_URL` | Neon Postgres |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (Fotos) |
| `APP_PASSWORD` | gemeinsames Login-Passwort |
| `SESSION_SECRET` | Signatur des Login-Cookies (`openssl rand -base64 32`) |
