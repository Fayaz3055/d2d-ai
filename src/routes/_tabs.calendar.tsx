import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { ScreenHeader } from "@/components/nova/screen-header";
import { EmptyState } from "@/components/nova/empty-state";
import { useEvents, eventTimestamp } from "@/features/events/use-events";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — D2D AI" },
      { name: "description", content: "Your schedule, beautifully organized." },
      { property: "og:title", content: "Calendar — D2D AI" },
      { property: "og:description", content: "Your schedule, beautifully organized." },
    ],
  }),
  component: CalendarScreen,
});

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function CalendarScreen() {
  const events = useEvents();
  const today = new Date();
  const [selected, setSelected] = useState<string>(toISODate(today));

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i - 2);
    return d;
  });

  const visible = useMemo(() => {
    return [...events]
      .filter((e) => e.date === selected)
      .sort((a, b) => eventTimestamp(a) - eventTimestamp(b));
  }, [events, selected]);

  return (
    <div className="animate-fade-up">
      <ScreenHeader
        title="Calendar"
        subtitle={today.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      />

      <div className="mx-5 mb-5 flex justify-between gap-1.5">
        {days.map((d) => {
          const iso = toISODate(d);
          const active = iso === selected;
          return (
            <button
              key={iso}
              onClick={() => setSelected(iso)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl border py-3 text-xs font-medium transition-colors",
                active
                  ? "border-primary/40 bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-[10px] uppercase tracking-wider opacity-80">
                {d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}
              </span>
              <span className="text-base font-semibold">{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className="px-5">
        {visible.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No events"
            description="Nothing scheduled. Add an event with Quick Capture."
          />
        ) : (
          <ul className="space-y-2">
            {visible.map((e) => (
              <li key={e.id}>
                <Link
                  to="/events/$id"
                  params={{ id: e.id }}
                  className="nova-card flex items-center gap-3 p-3.5"
                >
                  <span className="flex h-11 w-11 flex-none flex-col items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <span className="text-sm font-semibold leading-none">{e.time || "—"}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold tracking-tight">
                      {e.title}
                    </span>
                    {e.notes ? (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {e.notes}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
