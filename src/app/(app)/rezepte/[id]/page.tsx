import { ArrowLeft, ChefHat, Clock, Link as LinkIcon, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CookedTodayButton } from "@/components/cooked-today-button";
import { TodoToggle } from "@/components/todo-toggle";
import { Avatar } from "@/components/avatar";
import { CookedBadge } from "@/components/cooked-badge";
import { IngredientList } from "@/components/ingredient-list";
import { NotesForm } from "@/components/notes-form";
import { RatingSlider } from "@/components/rating-slider";
import { formatScore } from "@/components/score";
import { requirePerson } from "@/lib/auth";
import { avatarUrls } from "@/lib/avatars";
import { PEOPLE, PERSON_IDS } from "@/lib/people";
import { todayBerlin } from "@/lib/format-date";
import { averageScore, getRecipe, lines } from "@/lib/recipes";

export async function generateMetadata({ params }: PageProps<"/rezepte/[id]">) {
  const { id } = await params;
  const recipe = await getRecipe(Number(id));
  return { title: recipe ? `${recipe.title} · Unser Kochbuch` : "Unser Kochbuch" };
}

export default async function RecipePage({ params }: PageProps<"/rezepte/[id]">) {
  const [{ id }, person] = await Promise.all([params, requirePerson()]);
  const recipe = await getRecipe(Number(id));
  if (!recipe) notFound();

  const ingredients = lines(recipe.ingredients);
  const steps = lines(recipe.steps);
  const scores = Object.fromEntries(
    PERSON_IDS.flatMap((p) => (recipe.ratings[p] ? [[p, recipe.ratings[p]!.score]] : [])),
  );
  const average = averageScore(scores);
  const avatars = avatarUrls();

  return (
    <article className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted">
          <ArrowLeft className="size-4" />
          Alle Rezepte
        </Link>
        <Link
          href={`/rezepte/${recipe.id}/bearbeiten`}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm"
        >
          <Pencil className="size-3.5" />
          Bearbeiten
        </Link>
      </div>

      {/* Fotos */}
      {recipe.photos.length > 0 ? (
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4">
          {recipe.photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`relative aspect-[4/3] shrink-0 snap-center overflow-hidden rounded-3xl bg-line ${
                recipe.photos.length === 1 ? "w-full" : "w-[85%]"
              }`}
            >
              <Image
                src={photo.url}
                alt={index === 0 ? recipe.title : ""}
                fill
                priority={index === 0}
                sizes="(min-width: 768px) 640px, 85vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <Link
          href={`/rezepte/${recipe.id}/bearbeiten`}
          className="flex aspect-[3/1] flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed border-line text-sm text-muted"
        >
          <ChefHat className="size-7" strokeWidth={1.4} />
          Foto hinzufügen
        </Link>
      )}

      {/* Titel */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-sm font-medium text-accent">{recipe.category}</p>
          <CookedBadge date={recipe.lastCookedOn} className="text-sm" />
        </div>
        <h1 className="font-display text-4xl leading-tight font-semibold text-balance">{recipe.title}</h1>
        {recipe.description && <p className="text-lg text-muted">{recipe.description}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {recipe.minutes && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" />
              {recipe.minutes} Min.
            </span>
          )}
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 underline underline-offset-2"
            >
              <LinkIcon className="size-4" />
              Original
            </a>
          )}
        </div>
      </header>

      {/* TODO / Heute gekocht – schließen sich gegenseitig aus */}
      <div className="grid grid-cols-2 gap-2">
        <TodoToggle recipeId={recipe.id} todo={recipe.todo} />
        <CookedTodayButton recipeId={recipe.id} cookedToday={recipe.lastCookedOn === todayBerlin()} />
      </div>

      {/* Zutaten */}
      {ingredients.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display text-2xl font-semibold">Zutaten</h2>
          <IngredientList items={ingredients} />
        </section>
      )}

      {/* Zubereitung */}
      {steps.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-semibold">Zubereitung</h2>
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  {index + 1}
                </span>
                <p className="pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Bewertungen */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold">Bewertung</h2>
          {average !== null && (
            <p className="text-sm text-muted">
              Zusammen <span className="font-semibold text-ink tabular-nums">{formatScore(average)}/10</span>
            </p>
          )}
        </div>
        <div className="space-y-4 rounded-3xl border border-line bg-surface p-4">
          {PERSON_IDS.map((p) => (
            <RatingSlider
              key={p}
              recipeId={recipe.id}
              score={recipe.ratings[p]?.score}
              label={p === person ? "Du" : PEOPLE[p].name}
              editable={p === person}
              colorClass={PEOPLE[p].text}
              avatar={<Avatar person={p} url={avatars[p]} className="size-8 text-xs" />}
            />
          ))}
        </div>
      </section>

      {/* Notizen */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">Notizen</h2>
        <NotesForm recipeId={recipe.id} notes={recipe.notes} />
      </section>
    </article>
  );
}
