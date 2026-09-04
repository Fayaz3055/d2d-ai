import { createFileRoute, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { Pencil, Trash2, Calendar, Clock, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/nova/page-shell";
import { ConfirmDeleteDialog } from "@/components/nova/confirm-delete";
import { remindersStore, useReminder } from "@/features/reminders/use-reminders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/reminders/$id")({
  head: () => ({
    meta: [
      { title: "Reminder — D2D AI" },
      { name: "description", content: "Reminder details." },
      { property: "og:title", content: "Reminder — D2D AI" },
      { property: "og:description", content: "Reminder details." },
    ],
  }),
  component: ReminderDetail,
});

function ReminderDetail() {
  const { id } = Route.useParams();
  const reminder = useReminder(id);
  const navigate = useNavigate();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  if (!reminder) throw notFound();

  const handleDelete = () => {
    remindersStore.remove(reminder.id);
    toast("Reminder deleted");
    if (window.history.length > 1) router.history.back();
    else router.navigate({ to: "/reminders" });
  };

  const dateLabel = reminder.date
    ? new Date(reminder.date + "T00:00:00").toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Any day";

  return (
    <PageShell
      eyebrow="Reminder"
      title={reminder.title}
      fallbackTo="/reminders"
      right={
        <button
          type="button"
          onClick={() => navigate({ to: "/reminders/$id/edit", params: { id: reminder.id } })}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition-all active:scale-95"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      }
    >
      <section className="nova-card flex items-start gap-3 p-5">
        <button
          type="button"
          onClick={() => remindersStore.update(reminder.id, { done: !reminder.done })}
          className={cn(
            "mt-1 flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 transition-all",
            reminder.done
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:border-primary/60",
          )}
        >
          <Check className={cn("h-4 w-4", reminder.done ? "opacity-100" : "opacity-0")} strokeWidth={3} />
        </button>
        <h1
          className={cn(
            "text-xl font-semibold tracking-tight",
            reminder.done && "text-muted-foreground line-through",
          )}
        >
          {reminder.title}
        </h1>
      </section>
      <div className="mt-4 space-y-2.5">
        <Row icon={Calendar} label="Date" value={dateLabel} />
        <Row icon={Clock} label="Time" value={reminder.time || "Any time"} />
      </div>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/25 bg-background px-4 py-3 text-sm font-semibold text-destructive transition-all hover:bg-destructive/5 active:scale-[0.98]"
      >
        <Trash2 className="h-4 w-4" /> Delete reminder
      </button>
      <ConfirmDeleteDialog open={confirm} onOpenChange={setConfirm} onConfirm={handleDelete} />
    </PageShell>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="nova-card flex items-center justify-between gap-3 px-4 py-3">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
