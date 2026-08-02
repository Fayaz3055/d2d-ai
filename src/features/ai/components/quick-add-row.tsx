import { Link } from "@tanstack/react-router";
import { BellRing, CalendarDays, ListChecks, Sparkles, StickyNote } from "lucide-react";

const ITEMS = [
  { to: "/capture/task", label: "Task", icon: ListChecks },
  { to: "/capture/note", label: "Note", icon: StickyNote },
  { to: "/capture/thought", label: "Thought", icon: Sparkles },
  { to: "/capture/event", label: "Event", icon: CalendarDays },
  { to: "/capture/reminder", label: "Reminder", icon: BellRing },
] as const;

/** Quick Add row on the AI home screen. */
export function QuickAddRow() {
  return (
    <section>
      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Quick Add
      </p>
      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="nova-card flex w-[86px] shrink-0 flex-col items-center gap-1.5 px-2 py-3 transition-transform active:scale-[0.97]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-semibold tracking-tight">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
