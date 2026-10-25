import { Bell } from "lucide-react";
import Link from "next/link";
import { MarkActivitySeen } from "@/components/mark-activity-seen";
import { recentActivity } from "@/lib/activity";
import { describeActivity, timeAgo } from "@/lib/activity-format";
import { PEOPLE } from "@/lib/people";

export const metadata = { title: "Aktivität · Unser Kochbuch" };

export default async function ActivityPage() {
  const items = await recentActivity();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Aktivität</h1>
      <MarkActivitySeen uptoId={items[0]?.id ?? 0} />

      {items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center text-muted">
          <Bell className="mb-3 size-8" strokeWidth={1.5} />
          <p>Noch nichts passiert. Sobald einer von euch etwas einträgt, steht es hier.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
          {items.map((item) => {
            const person = PEOPLE[item.actor];
            const body = (
              <>
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${person.bg}`}
                >
                  {person.initial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">{describeActivity(item)}</span>
                  <span className="text-xs text-muted">{timeAgo(item.createdAt)}</span>
                </span>
              </>
            );
            return (
              <li key={item.id}>
                {item.recipeId ? (
                  <Link href={`/rezepte/${item.recipeId}`} className="flex items-start gap-3 p-3">
                    {body}
                  </Link>
                ) : (
                  <div className="flex items-start gap-3 p-3">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
