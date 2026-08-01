import { useState } from "react";
import { toast } from "sonner";
import { Check, ListChecks, StickyNote, Sparkles, CalendarDays, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import { tasksStore } from "@/features/tasks/use-tasks";
import { notesStore } from "@/features/notes/use-notes";
import { thoughtsStore } from "@/features/thoughts/use-thoughts";
import { eventsStore } from "@/features/events/use-events";
import { remindersStore } from "@/features/reminders/use-reminders";
import type { CaptureKind, CaptureProposal } from "../types";

const KIND_META: Record<CaptureKind, { label: string; icon: typeof ListChecks }> = {
  task: { label: "Task", icon: ListChecks },
  note: { label: "Note", icon: StickyNote },
  thought: { label: "Thought", icon: Sparkles },
  event: { label: "Event", icon: CalendarDays },
  reminder: { label: "Reminder", icon: BellRing },
};

function saveProposal(item: CaptureProposal) {
  switch (item.kind) {
    case "task":
      tasksStore.add({
        title: item.title,
        description: item.details ?? "",
        dueDate: item.date ?? "",
        priority: item.priority ?? "medium",
        category: item.category ?? "other",
      });
      break;
    case "note":
      notesStore.add({ title: item.title, body: item.details ?? "" });
      break;
    case "thought":
      thoughtsStore.add({ thought: item.details || item.title, tag: item.tag ?? "" });
      break;
    case "event":
      eventsStore.add({
        title: item.title,
        date: item.date ?? "",
        time: item.time ?? "",
        notes: item.details ?? "",
      });
      break;
    case "reminder":
      remindersStore.add({
        title: item.title,
        date: item.date ?? "",
        time: item.time ?? "",
      });
      break;
  }
}

/** Confirmation card for AI-extracted items. Nothing is saved until the user taps Add. */
export function CaptureProposals({ items }: { items: CaptureProposal[] }) {
  const [saved, setSaved] = useState<Record<number, boolean>>({});

  if (!items?.length) return null;

  const addAll = () => {
    let count = 0;
    items.forEach((item, i) => {
      if (saved[i]) return;
      saveProposal(item);
      count += 1;
    });
    setSaved(Object.fromEntries(items.map((_, i) => [i, true])));
    if (count) toast.success(`${count} item${count > 1 ? "s" : ""} added`);
  };

  const allSaved = items.every((_, i) => saved[i]);

  return (
    <div className="nova-card mt-2 w-full overflow-hidden p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Suggested captures
        </p>
        <button
          type="button"
          onClick={addAll}
          disabled={allSaved}
          className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all active:scale-95 disabled:bg-muted disabled:text-muted-foreground"
        >
          {allSaved ? "Added" : "Add all"}
        </button>
      </div>

      <ul className="mt-3 divide-y divide-border/60">
        {items.map((item, i) => {
          const meta = KIND_META[item.kind] ?? KIND_META.task;
          const Icon = meta.icon;
          const isSaved = !!saved[i];
          return (
            <li key={`${item.kind}-${i}`} className="flex items-center gap-3 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold tracking-tight">{item.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {meta.label}
                  {item.date ? ` · ${item.date}` : ""}
                  {item.time ? ` ${item.time}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isSaved) return;
                  saveProposal(item);
                  setSaved((prev) => ({ ...prev, [i]: true }));
                  toast.success(`${meta.label} added`);
                }}
                disabled={isSaved}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
                  isSaved
                    ? "border-transparent bg-muted text-muted-foreground"
                    : "border-primary/40 text-primary hover:bg-primary/10",
                )}
              >
                {isSaved ? <Check className="h-3.5 w-3.5" /> : "Add"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
