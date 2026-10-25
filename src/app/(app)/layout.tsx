import { LogOut } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "@/components/toaster";
import { unreadFor } from "@/lib/activity";
import { requirePerson } from "@/lib/auth";
import { avatarUrls } from "@/lib/avatars";
import { PEOPLE } from "@/lib/people";
import { logout } from "../login/actions";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const person = await requirePerson();
  const unread = await unreadFor(person);
  const background = process.env.BACKGROUND_IMAGE_URL;

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col">
      {background && (
        // Liegt in Vercel Blob statt im (öffentlichen) Repo und wird erst nach dem Login ausgeliefert.
        // Winzige Bilddatei, die hochskaliert von selbst weich wirkt – kein teurer CSS-Blur beim Scrollen.
        // h-lvh reicht bis unter die Safari-Leisten, damit unten nichts abgeschnitten aussieht.
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={background}
            alt=""
            className="size-full object-cover object-[20%_center]"
          />
          <div className="absolute inset-0 bg-paper/80" />
        </div>
      )}
      <header className="flex items-center justify-between gap-3 px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
        <Link
          href="/"
          className="min-w-0 font-display text-[clamp(1rem,4.6vw,1.5rem)] leading-tight font-semibold tracking-tight whitespace-nowrap"
        >
          Lisa und Bennys Kochbuch
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-full border border-line bg-surface py-0.5 pr-2 pl-0.5 text-sm text-muted"
              aria-label={`Abmelden (${PEOPLE[person].name})`}
            >
              <Avatar
                person={person}
                url={avatarUrls()[person]}
                className="size-7 text-xs"
              />
              <LogOut className="size-3.5" />
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-4 pb-36">{children}</main>
      <Toaster />
      <BottomNav activity={unread} />
    </div>
  );
}
