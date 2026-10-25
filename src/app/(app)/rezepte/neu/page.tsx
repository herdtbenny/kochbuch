import { RecipeForm } from "@/components/recipe-form";

export const metadata = { title: "Neues Rezept · Unser Kochbuch" };

export default function NewRecipePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Neues Rezept</h1>
      <RecipeForm />
    </div>
  );
}
