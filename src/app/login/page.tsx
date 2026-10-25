import { ChefHat } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Anmelden · Unser Kochbuch" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-12">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-accent text-accent-ink">
          <ChefHat className="size-8" strokeWidth={1.6} />
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Unser Kochbuch</h1>
        <p className="mt-2 text-muted">Alles, was wir zusammen gekocht haben.</p>
      </div>
      <LoginForm
        avatars={{ benny: process.env.AVATAR_BENNY_URL, lisa: process.env.AVATAR_LISA_URL }}
      />
    </main>
  );
}
