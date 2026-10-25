"use client";

import { useActionState } from "react";
import { PEOPLE, PERSON_IDS } from "@/lib/people";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="space-y-5">
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-muted">Wer bist du?</legend>
        <div className="grid grid-cols-2 gap-3">
          {PERSON_IDS.map((id) => (
            <label
              key={id}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-line bg-surface p-4 transition-colors has-checked:border-accent"
            >
              <input type="radio" name="person" value={id} className="sr-only" required />
              <span
                className={`flex size-12 items-center justify-center rounded-full text-lg font-semibold text-white ${PEOPLE[id].bg}`}
              >
                {PEOPLE[id].initial}
              </span>
              <span className="font-medium">{PEOPLE[id].name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted">Passwort</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full rounded-full border border-line bg-surface px-5 py-3 outline-none focus:border-accent"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-accent">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-5 py-3.5 font-semibold text-accent-ink transition-opacity disabled:opacity-60"
      >
        {pending ? "Einen Moment …" : "Los geht's"}
      </button>
    </form>
  );
}
