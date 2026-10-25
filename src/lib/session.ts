import { isPerson, type Person } from "./people";

// Nur Web Crypto, damit es auch im Proxy läuft.

export const SESSION_COOKIE = "kochbuch_session";

const encoder = new TextEncoder();

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET ist nicht gesetzt");
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function toBase64Url(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
}

/** Cookie-Wert: "<person>.<hmac>" */
export async function signSession(person: Person) {
  const signature = await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(person));
  return `${person}.${toBase64Url(signature)}`;
}

export async function verifySession(value: string | undefined): Promise<Person | null> {
  if (!value) return null;
  const [person, signature] = value.split(".");
  if (!isPerson(person) || !signature) return null;
  try {
    const valid = await crypto.subtle.verify("HMAC", await getKey(), fromBase64Url(signature), encoder.encode(person));
    return valid ? person : null;
  } catch {
    return null;
  }
}
