"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isPerson } from "@/lib/people";
import { SESSION_COOKIE, signSession } from "@/lib/session";

export type LoginState = { error?: string };

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const person = formData.get("person");
  const password = formData.get("password");

  if (!isPerson(person)) return { error: "Wer bist du?" };
  if (!process.env.APP_PASSWORD || password !== process.env.APP_PASSWORD) {
    return { error: "Das Passwort stimmt nicht." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(person), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
