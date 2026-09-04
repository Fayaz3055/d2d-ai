import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CapturePage, Field, fieldInputCn } from "@/features/quick-capture/capture-page";
import { eventsStore, useEvent } from "@/features/events/use-events";

export const Route = createFileRoute("/events/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Event — D2D AI" },
      { name: "description", content: "Update your event." },
      { property: "og:title", content: "Edit Event — D2D AI" },
      { property: "og:description", content: "Update your event." },
    ],
  }),
  component: EditEvent,
});

function EditEvent() {
  const { id } = Route.useParams();
  const event = useEvent(id);
  const router = useRouter();
  const [form, setForm] = useState(() =>
    event
      ? { title: event.title, date: event.date, time: event.time, notes: event.notes }
      : null,
  );
  if (!event) throw notFound();
  if (!form) return null;
  const initial = { title: event.title, date: event.date, time: event.time, notes: event.notes };
  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);

  const save = () => {
    if (!form.title.trim()) return;
    eventsStore.update(event.id, {
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      notes: form.notes.trim(),
    });
    toast.success("Event updated");
    setTimeout(() => {
      if (window.history.length > 1) router.history.back();
      else router.navigate({ to: "/events/$id", params: { id: event.id } });
    }, 100);
  };

  return (
    <CapturePage
      eyebrow="Edit"
      title="Event"
      isDirty={isDirty}
      saveDisabled={!form.title.trim()}
      onSave={save}
      saveLabel="Save"
    >
      <div className="space-y-6">
        <Field label="Event title" required>
          <input
            autoFocus
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={fieldInputCn}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={fieldInputCn}
            />
          </Field>
          <Field label="Time">
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className={fieldInputCn}
            />
          </Field>
        </div>
        <Field label="Notes" hint="Optional">
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={5}
            className={`${fieldInputCn} resize-none leading-relaxed`}
          />
        </Field>
      </div>
    </CapturePage>
  );
}
