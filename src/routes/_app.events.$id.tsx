import { createFileRoute, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { Pencil, Trash2, Calendar, Clock, StickyNote } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/nova/page-shell";
import { ConfirmDeleteDialog } from "@/components/nova/confirm-delete";
import { eventsStore, useEvent } from "@/features/events/use-events";

export const Route = createFileRoute("/_app/events/$id")({
  head: () => ({
    meta: [
      { title: "Event — D2D AI" },
      { name: "description", content: "Event details." },
      { property: "og:title", content: "Event — D2D AI" },
      { property: "og:description", content: "Event details." },
    ],
  }),
  component: EventDetail,
});

function EventDetail() {
  const { id } = Route.useParams();
  const event = useEvent(id);
  const navigate = useNavigate();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  if (!event) throw notFound();

  const handleDelete = () => {
    eventsStore.remove(event.id);
    toast("Event deleted");
    if (window.history.length > 1) router.history.back();
    else router.navigate({ to: "/events" });
  };

  const dateLabel = event.date
    ? new Date(event.date + "T00:00:00").toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "No date";

  return (
    <PageShell
      eyebrow="Event"
      title={event.title}
      fallbackTo="/events"
      right={
        <button
          type="button"
          onClick={() => navigate({ to: "/events/$id/edit", params: { id: event.id } })}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition-all active:scale-95"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      }
    >
      <section className="nova-card p-5">
        <h1 className="text-xl font-semibold tracking-tight">{event.title}</h1>
      </section>
      <div className="mt-4 space-y-2.5">
        <MetaRow icon={Calendar} label="Date" value={dateLabel} />
        <MetaRow icon={Clock} label="Time" value={event.time || "All day"} />
        {event.notes ? (
          <div className="nova-card p-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <StickyNote className="h-3.5 w-3.5" />
              Notes
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {event.notes}
            </p>
          </div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/25 bg-background px-4 py-3 text-sm font-semibold text-destructive transition-all hover:bg-destructive/5 active:scale-[0.98]"
      >
        <Trash2 className="h-4 w-4" /> Delete event
      </button>
      <ConfirmDeleteDialog open={confirm} onOpenChange={setConfirm} onConfirm={handleDelete} />
    </PageShell>
  );
}

function MetaRow({
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
