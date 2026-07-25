import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Plus } from "lucide-react";
import { PageShell } from "@/components/nova/page-shell";
import { EmptyState } from "@/components/nova/empty-state";
import { useEvents, eventTimestamp } from "@/features/events/use-events";
import { quickCapture } from "@/features/quick-capture/quick-capture-store";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — D2D AI" },
      { name: "description", content: "All your upcoming events." },
      { property: "og:title", content: "Events — D2D AI" },
      { property: "og:description", content: "All your events." },
    ],
  }),
  component: EventsList,
});

function EventsList() {
  const events = [...useEvents()].sort((a, b) => eventTimestamp(a) - eventTimestamp(b));
  return (
    <PageShell eyebrow="Schedule" title="Events" fallbackTo="/calendar">
      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events"
          description="Add an event with Quick Capture."
        />
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                to="/events/$id"
                params={{ id: e.id }}
                className="nova-card flex items-center gap-3 p-3.5"
              >
                <span className="flex h-12 w-12 flex-none flex-col items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">
                    {e.date
                      ? new Date(e.date + "T00:00:00").toLocaleDateString(undefined, { month: "short" })
                      : "TBD"}
                  </span>
                  <span className="text-lg font-semibold leading-none">
                    {e.date ? new Date(e.date + "T00:00:00").getDate() : "—"}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold tracking-tight">
                    {e.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {e.time || "All day"}
                    {e.notes ? ` · ${e.notes.slice(0, 40)}` : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => quickCapture.open()}
        className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition-all hover:opacity-95 active:scale-95"
      >
        <Plus className="h-4 w-4" strokeWidth={2.6} /> New Event
      </button>
    </PageShell>
  );
}
