import { useState } from "react";
import { Plus, CheckSquare, StickyNote, Brain, Bell, CalendarPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { label: "Task", icon: CheckSquare },
  { label: "Note", icon: StickyNote },
  { label: "Thought", icon: Brain },
  { label: "Reminder", icon: Bell },
  { label: "Event", icon: CalendarPlus },
];

export function QuickCaptureFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* action stack */}
      <div
        className={cn(
          "fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-5 z-50 flex flex-col items-end gap-2.5",
          "transition-all",
        )}
      >
        {actions.map((a, i) => (
          <button
            key={a.label}
            type="button"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-full bg-card px-4 py-2.5 text-sm font-medium shadow-[var(--shadow-card)]",
              "border border-border/60 text-foreground",
              "transition-all duration-300",
              open
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-4 opacity-0",
            )}
            style={{ transitionDelay: open ? `${i * 30}ms` : "0ms" }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <a.icon className="h-4 w-4" />
            </span>
            {a.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label="Quick capture"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] right-5 z-50",
          "flex h-14 w-14 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-[var(--shadow-float)] transition-all duration-300",
          "hover:scale-105 active:scale-95",
          open && "rotate-45",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" strokeWidth={2.4} />}
      </button>
    </>
  );
}
