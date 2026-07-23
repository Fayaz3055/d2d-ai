import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { ScreenHeader } from "@/components/nova/screen-header";
import { EmptyState } from "@/components/nova/empty-state";

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

function CalendarScreen() {
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i - 2);
    return d;
  });

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
          const isToday = d.toDateString() === today.toDateString();
          return (
            <button
              key={d.toISOString()}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border py-3 text-xs font-medium transition-colors ${
                isToday
                  ? "border-primary/40 bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
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
        <EmptyState
          icon={CalendarDays}
          title="No events"
          description="Your day is open. Add an event with Quick Capture."
        />
      </div>
    </div>
  );
}
