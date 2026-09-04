import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, Plus, Check } from "lucide-react";
import { PageShell } from "@/components/nova/page-shell";
import { EmptyState } from "@/components/nova/empty-state";
import { useReminders, remindersStore, reminderTimestamp } from "@/features/reminders/use-reminders";
import { quickCapture } from "@/features/quick-capture/quick-capture-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "Reminders — D2D AI" },
      { name: "description", content: "Nudges at the right time." },
      { property: "og:title", content: "Reminders — D2D AI" },
      { property: "og:description", content: "Your reminders." },
    ],
  }),
  component: RemindersList,
});

function RemindersList() {
  const reminders = [...useReminders()].sort((a, b) => reminderTimestamp(a) - reminderTimestamp(b));
  return (
    <PageShell eyebrow="Alerts" title="Reminders">
      {reminders.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No reminders yet"
          description="Set a reminder and get a gentle nudge at the right moment."
        />
      ) : (
        <ul className="space-y-2">
          {reminders.map((r) => (
            <li key={r.id} className="flex items-center gap-2">
              <button
                type="button"
                aria-label={r.done ? "Mark undone" : "Mark done"}
                onClick={() => remindersStore.update(r.id, { done: !r.done })}
                className={cn(
                  "flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 transition-all",
                  r.done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/60",
                )}
              >
                <Check
                  className={cn("h-3.5 w-3.5 transition-all", r.done ? "opacity-100" : "opacity-0")}
                  strokeWidth={3}
                />
              </button>
              <Link
                to="/reminders/$id"
                params={{ id: r.id }}
                className="nova-card flex flex-1 items-center gap-3 p-3.5"
              >
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <BellRing className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-[15px] font-semibold tracking-tight",
                      r.done && "text-muted-foreground line-through",
                    )}
                  >
                    {r.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {r.date
                      ? new Date(r.date + "T00:00:00").toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "Any day"}
                    {r.time ? ` · ${r.time}` : ""}
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
        <Plus className="h-4 w-4" strokeWidth={2.6} /> New Reminder
      </button>
    </PageShell>
  );
}
