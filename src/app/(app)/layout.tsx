import { LogOut } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { requirePerson } from "@/lib/auth";
import { PEOPLE } from "@/lib/people";
import { logout } from "../login/actions";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const person = await requirePerson();

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col">
      <header className="flex items-center justify-between gap-4 px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
          Unser Kochbuch
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1 text-sm text-muted"
            aria-label={`Abmelden (${PEOPLE[person].name})`}
          >
            <span
              className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold text-white ${PEOPLE[person].bg}`}
            >
              {PEOPLE[person].initial}
            </span>
            <LogOut className="size-4" />
          </button>
        </form>
      </header>
      <main className="flex-1 px-4 pb-36">{children}</main>
      <BottomNav />
    </div>
  );
}
