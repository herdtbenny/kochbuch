import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/** Alles außer Login und Icons ist nur für Benny & Lisa. */
export async function proxy(request: NextRequest) {
  const person = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!person) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|icon|apple-icon|manifest.webmanifest|sw.js).*)"],
};
