# Unser Kochbuch

Ein gemeinsames Rezeptbuch für Benny & Lisa: alle unsere Rezepte, mit Fotos und getrennten Bewertungen. Läuft als Web-App und lässt sich auf dem iPhone über „Teilen → Zum Home-Bildschirm“ wie eine App installieren.

## Funktionen

- **Rezepte** mit Fotos (werden im Browser verkleinert), Kategorie, Zeit, Portionen, Zutaten, Zubereitung und Link zum Original
- **Zwei Bewertungen** (1–10): Jeder bewertet für sich, plus optionaler Kommentar
- **Benachrichtigungen**: Rückblick „Seit du weg warst“, Live-Hinweis und Aktivitätsseite, wenn der andere etwas einträgt
- **Suche** nach Gericht oder Zutat („was machen wir mit der Zucchini?“), Filter nach Kategorie, Sortierung nach Bewertung, Name oder Datum
- **Zufall**: schlägt ein gut bewertetes Gericht vor
- **Statistik**: Durchschnittsbewertungen, Top 5, wo ihr euch uneinig seid, Rezepte pro Kategorie
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
