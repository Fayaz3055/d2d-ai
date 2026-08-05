import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  BellRing,
  CalendarDays,
  Check,
  FolderPlus,
  ListChecks,
  Loader2,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { tasksStore } from "@/features/tasks/use-tasks";
import { notesStore } from "@/features/notes/use-notes";
import { eventsStore } from "@/features/events/use-events";
import { remindersStore } from "@/features/reminders/use-reminders";
import { projectsStore } from "@/features/projects/use-projects";
import { elaborateThought, planFromPattern } from "./thought-ai.functions";
import { logThoughtEvent } from "./timeline";
import { thoughtsStore, type Thought } from "./use-thoughts";

type ActionKind = "task" | "reminder" | "event" | "goal" | "project" | "expand" | "summarize";

const ACTION_META: Record<ActionKind, { label: string; icon: typeof ListChecks }> = {
  task: { label: "Create Task", icon: ListChecks },
  reminder: { label: "Create Reminder", icon: BellRing },
  event: { label: "Create Event", icon: CalendarDays },
  goal: { label: "Convert to Goal", icon: Target },
  project: { label: "Create Project", icon: FolderPlus },
  expand: { label: "Expand Idea", icon: Wand2 },
  summarize: { label: "Summarize", icon: Sparkles },
};

const ORDER: ActionKind[] = [
  "task",
  "reminder",
  "event",
  "goal",
  "project",
  "expand",
  "summarize",
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function shortTitle(text: string) {
  const line = text.trim().split("\n")[0] ?? "";
  return line.length > 80 ? `${line.slice(0, 77)}…` : line;
}

/** Saves one durable goal into the companion's long-term memory. */
async function rememberGoal(label: string, text: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await supabase
    .from("ai_memory")
    .insert({
      user_id: auth.user.id,
      kind: "goal",
      label: label.slice(0, 120),
      content: { text: text.slice(0, 600) },
    } as never);
}

type Pending =
  | { kind: "task" | "reminder" | "event" | "goal"; title: string }
  | { kind: "project"; plan: Awaited<ReturnType<typeof planFromPattern>> }
  | { kind: "expand" | "summarize"; text: string; tasks: string[] };

/**
 * AI actions for one thought. Nothing is ever created until the user confirms
 * the proposal shown after tapping an action.
 */
export function ThoughtAiActions({
  thought,
  onChanged,
}: {
  thought: Thought;
  onChanged?: () => void;
}) {
  const elaborate = useServerFn(elaborateThought);
  const plan = useServerFn(planFromPattern);
  const [busy, setBusy] = useState<ActionKind | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  const title = shortTitle(thought.thought);

  const start = async (kind: ActionKind) => {
    setPending(null);
    if (kind === "task" || kind === "reminder" || kind === "event" || kind === "goal") {
      setPending({ kind, title });
      return;
    }
    setBusy(kind);
    try {
      if (kind === "project") {
        const result = await plan({
          data: { category: thought.category, thoughts: [thought.thought] },
        });
        setPending({ kind: "project", plan: result });
      } else {
        const result = await elaborate({
          data: { text: thought.thought, category: thought.category, mode: kind },
        });
        if (!result.text) {
          toast.error("D2D AI couldn't answer right now. Try again.");
        } else {
          setPending({ kind, text: result.text, tasks: result.tasks ?? [] });
        }
      }
    } catch {
      toast.error("D2D AI is unavailable right now.");
    } finally {
      setBusy(null);
    }
  };

  const confirm = async () => {
    if (!pending) return;
    switch (pending.kind) {
      case "task":
        tasksStore.add({
          title: pending.title,
          description: thought.thought,
          dueDate: "",
          priority: "medium",
          category: "other",
        });
        await logThoughtEvent(thought.id, "tasks", pending.title);
        toast.success("Task created");
        break;
      case "reminder":
        remindersStore.add({ title: pending.title, date: today(), time: "09:00" });
        await logThoughtEvent(thought.id, "reminder", pending.title);
        toast.success("Reminder created for today, 09:00");
        break;
      case "event":
        eventsStore.add({
          title: pending.title,
          date: today(),
          time: "",
          notes: thought.thought,
        });
        await logThoughtEvent(thought.id, "event", pending.title);
        toast.success("Event created for today");
        break;
      case "goal":
        thoughtsStore.update(thought.id, { category: "goal", status: "goal" });
        await rememberGoal(pending.title, thought.thought);
        await logThoughtEvent(thought.id, "goal", pending.title);
        toast.success("Converted to a goal D2D AI will remember");
        break;
      case "project": {
        const p = pending.plan;
        projectsStore.add({
          title: p.projectTitle || title,
          description: p.projectDescription,
          status: "active",
          sourceThoughtId: thought.id.startsWith("tmp_") ? null : thought.id,
        });
        if (p.noteBody) notesStore.add({ title: p.noteTitle || title, body: p.noteBody });
        p.tasks.slice(0, 5).forEach((t) =>
          tasksStore.add({
            title: t,
            description: `From project: ${p.projectTitle || title}`,
            dueDate: "",
            priority: "medium",
            category: "other",
          }),
        );
        if (p.goal) await rememberGoal(p.projectTitle || title, p.goal);
        thoughtsStore.update(thought.id, { status: "project" });
        await logThoughtEvent(thought.id, "project", p.projectTitle || title);
        if (p.tasks.length) await logThoughtEvent(thought.id, "tasks", `${p.tasks.length} tasks`);
        toast.success("Project, goal, notes and tasks created");
        break;
      }
      case "expand":
      case "summarize": {
        notesStore.add({
          title: `${pending.kind === "expand" ? "Expanded" : "Summary"}: ${title}`,
          body: pending.text,
        });
        pending.tasks.slice(0, 5).forEach((t) =>
          tasksStore.add({
            title: t,
            description: `From thought: ${title}`,
            dueDate: "",
            priority: "medium",
            category: "other",
          }),
        );
        if (pending.kind === "expand") thoughtsStore.update(thought.id, { status: "expanded" });
        await logThoughtEvent(
          thought.id,
          pending.kind === "expand" ? "expanded" : "summarized",
          title,
        );
        if (pending.tasks.length)
          await logThoughtEvent(thought.id, "tasks", `${pending.tasks.length} tasks`);
        toast.success(pending.tasks.length ? "Note and tasks created" : "Note created");
        break;
      }
    }
    setPending(null);
    onChanged?.();
  };

  return (
    <section className="mt-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
        D2D AI actions
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {ORDER.map((kind) => {
          const meta = ACTION_META[kind];
          const Icon = meta.icon;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => void start(kind)}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold transition-all hover:border-primary/40 active:scale-95 disabled:opacity-50"
            >
              {busy === kind ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : (
                <Icon className="h-3.5 w-3.5 text-primary" />
              )}
              {meta.label}
            </button>
          );
        })}
      </div>

      {pending ? (
        <div className="nova-card animate-fade-up mt-4 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
            Confirm before saving
          </p>

          {pending.kind === "project" ? (
            <div className="mt-2 space-y-2 text-sm">
              <p className="font-semibold tracking-tight">
                {pending.plan.projectTitle || title}
              </p>
              <p className="text-[13px] text-muted-foreground">
                {pending.plan.projectDescription}
              </p>
              {pending.plan.goal ? (
                <p className="text-[13px]">
                  <span className="font-semibold">Goal:</span> {pending.plan.goal}
                </p>
              ) : null}
              {pending.plan.tasks.length ? (
                <ul className="list-disc space-y-1 pl-5 text-[13px] text-muted-foreground">
                  {pending.plan.tasks.slice(0, 5).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : pending.kind === "expand" || pending.kind === "summarize" ? (
            <div className="mt-2 space-y-2">
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{pending.text}</p>
              {pending.tasks.length ? (
                <ul className="list-disc space-y-1 pl-5 text-[13px] text-muted-foreground">
                  {pending.tasks.slice(0, 5).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm">
              {ACTION_META[pending.kind].label}: <span className="font-semibold">{pending.title}</span>
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void confirm()}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition-all active:scale-95"
            >
              <Check className="h-3.5 w-3.5" /> Confirm
            </button>
            <button
              type="button"
              onClick={() => setPending(null)}
              className="rounded-full border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
