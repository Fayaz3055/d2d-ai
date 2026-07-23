import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Plus,
  CheckCircle2,
  StickyNote,
  Sparkles,
  CalendarPlus,
  BellRing,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CaptureRoute =
  | "/capture/task"
  | "/capture/note"
  | "/capture/thought"
  | "/capture/event"
  | "/capture/reminder";

const actions: {
  to: CaptureRoute;
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  emoji: string;
}[] = [
  {
    to: "/capture/task",
    label: "New Task",
    description: "Something to do — with a due date & priority.",
    icon: CheckCircle2,
    emoji: "✅",
  },
  {
    to: "/capture/note",
    label: "New Note",
    description: "Save a longer idea or write it out in full.",
    icon: StickyNote,
    emoji: "📝",
  },
  {
    to: "/capture/thought",
    label: "New Thought",
    description: "Drop it here — I'll help you remember later.",
    icon: Sparkles,
    emoji: "💭",
  },
  {
    to: "/capture/event",
    label: "New Event",
    description: "Add something to your calendar.",
    icon: CalendarPlus,
    emoji: "📅",
  },
  {
    to: "/capture/reminder",
    label: "New Reminder",
    description: "Get a nudge at the right time.",
    icon: BellRing,
    emoji: "⏰",
  },
];

export function QuickCaptureFab() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    // Prevent body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handlePick = (to: CaptureRoute) => {
    setOpen(false);
    // let the sheet start closing before navigating
    setTimeout(() => navigate({ to }), 80);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-foreground/25 backdrop-blur-md transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick capture"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto max-w-xl px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]",
          "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0",
        )}
      >
        <div className="overflow-hidden rounded-[28px] border border-border/60 bg-background/95 shadow-[0_-12px_60px_oklch(0_0_0/0.15)] backdrop-blur-2xl">
          {/* Grabber */}
          <div className="flex justify-center pt-3">
            <span className="h-1.5 w-10 rounded-full bg-border" />
          </div>

          <div className="px-5 pb-3 pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              Quick Capture
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">What's on your mind?</h2>
          </div>

          <ul className="space-y-1.5 px-3 pb-4">
            {actions.map((a, i) => (
              <li
                key={a.to}
                style={{ transitionDelay: open ? `${60 + i * 40}ms` : "0ms" }}
                className={cn(
                  "transition-all duration-500 ease-out",
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
              >
                <button
                  type="button"
                  onClick={() => handlePick(a.to)}
                  className={cn(
                    "group flex w-full items-center gap-4 rounded-2xl border border-transparent bg-card px-3.5 py-3 text-left",
                    "transition-all duration-200",
                    "hover:border-primary/25 hover:bg-accent/60",
                    "active:scale-[0.985] active:bg-accent",
                  )}
                >
                  <span
                    aria-hidden
                    className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-accent text-lg shadow-[var(--shadow-soft)]"
                  >
                    <a.icon className="h-5 w-5 text-primary" strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold tracking-tight text-foreground">
                      {a.label}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {a.description}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 flex-none text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* FAB */}
      <button
        type="button"
        aria-label="Quick capture"
        aria-expanded={open}
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
