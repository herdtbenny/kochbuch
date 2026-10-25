import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";
import { RecipeForm } from "@/components/recipe-form";
import { getRecipe } from "@/lib/recipes";

export default async function EditRecipePage({ params }: PageProps<"/rezepte/[id]/bearbeiten">) {
  const { id } = await params;
  const recipe = await getRecipe(Number(id));
  if (!recipe) notFound();

  return (
    <div className="space-y-6">
      <Link href={`/rezepte/${recipe.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted">
        <ArrowLeft className="size-4" />
        Zurück
      </Link>
      <h1 className="font-display text-3xl font-semibold">Rezept bearbeiten</h1>
      <RecipeForm recipe={recipe} />
      <DeleteRecipeButton id={recipe.id} title={recipe.title} />
    </div>
  );
}
