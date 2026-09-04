import { createFileRoute, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft,
  Pencil,
  Trash2,
  Check,
  Calendar,
  Flag,
  Tag,
  Sparkles,
  ListTree,
  Paperclip,
  Timer,
} from "lucide-react";
import { useTask, tasksStore } from "@/features/tasks/use-tasks";
import { PriorityBadge, CategoryBadge } from "@/features/tasks/badges";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/nova/confirm-delete";
import type { ReactNode } from "react";

export const Route = createFileRoute("/_app/tasks/$id")({
  head: () => ({
    meta: [
      { title: "Task Details — D2D AI" },
      { name: "description", content: "Task details, priority, category, and progress." },
      { property: "og:title", content: "Task Details — D2D AI" },
      { property: "og:description", content: "Every detail of your task in one calm view." },
    ],
  }),
  component: TaskDetail,
  notFoundComponent: () => (
    <FallbackShell title="Task not found">
      <p className="text-sm text-muted-foreground">This task may have been deleted.</p>
    </FallbackShell>
  ),
});

function FallbackShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-xl px-5 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function formatDue(due: string) {
  if (!due) return "No due date";
  const d = new Date(due + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function TaskDetail() {
  const { id } = Route.useParams();
  const task = useTask(id);
  const router = useRouter();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  if (!task) throw notFound();

  const goBack = () => {
    if (window.history.length > 1) router.history.back();
    else navigate({ to: "/tasks" });
  };

  const handleDelete = () => {
    tasksStore.remove(task.id);
    toast("Task deleted");
    goBack();
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-3 py-3 backdrop-blur-xl">
          <button
            type="button"
            onClick={goBack}
            className="-ml-1 flex h-10 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
            Task Details
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/tasks/$id/edit", params: { id: task.id } })}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition-all hover:opacity-95 active:scale-95"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        </header>

        <div className="flex-1 space-y-5 px-5 pb-24 pt-6 animate-fade-in">
          {/* Title card */}
          <section className="nova-card p-5">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => tasksStore.toggle(task.id)}
                aria-label={task.completed ? "Mark incomplete" : "Complete task"}
                className={cn(
                  "mt-1 flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 transition-all",
                  task.completed
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_oklch(0.72_0.14_85/0.15)]"
                    : "border-border bg-background hover:border-primary/60",
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4 transition-all",
                    task.completed ? "scale-100 opacity-100" : "scale-50 opacity-0",
                  )}
                  strokeWidth={3}
                />
              </button>
              <div className="min-w-0 flex-1">
                <h1
                  className={cn(
                    "text-xl font-semibold tracking-tight",
                    task.completed && "line-through decoration-primary/70",
                  )}
                >
                  {task.title}
                </h1>
                {task.description ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {task.description}
                  </p>
                ) : (
                  <p className="mt-2 text-sm italic text-muted-foreground/70">
                    No description.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Meta grid */}
          <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <MetaRow icon={Calendar} label="Due date">
              <span className="text-sm font-medium">{formatDue(task.dueDate)}</span>
            </MetaRow>
            <MetaRow icon={Flag} label="Priority">
              <PriorityBadge value={task.priority} />
            </MetaRow>
            <MetaRow icon={Tag} label="Category">
              <CategoryBadge value={task.category} />
            </MetaRow>
            <MetaRow icon={Check} label="Status">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  task.completed
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                {task.completed ? "Completed" : "In progress"}
              </span>
            </MetaRow>
          </section>

          {/* Reserved sections */}
          <ComingSoon icon={Sparkles} title="AI Suggestions" subtitle="Smart next steps, tailored to this task." />
          <ComingSoon icon={ListTree} title="Subtasks" subtitle="Break this down into smaller wins." />
          <ComingSoon icon={Paperclip} title="Attachments" subtitle="Files, links, and references." />
          <ComingSoon icon={Timer} title="Time Tracking" subtitle="Focus sessions and elapsed time." />

          {/* Danger */}
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/25 bg-background px-4 py-3 text-sm font-semibold text-destructive transition-all hover:bg-destructive/5 active:scale-[0.98]"
          >
            <Trash2 className="h-4 w-4" />
            Delete task
          </button>
        </div>
      </div>
      <ConfirmDeleteDialog open={confirm} onOpenChange={setConfirm} onConfirm={handleDelete} />
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="nova-card flex items-center justify-between gap-3 px-4 py-3">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="min-w-0 text-right">{children}</span>
    </div>
  );
}

function ComingSoon({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="nova-card flex items-center gap-3 p-4">
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold tracking-tight">{title}</p>
          <span className="rounded-full border border-primary/30 bg-primary/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
            Soon
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
