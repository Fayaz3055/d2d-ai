import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CapturePage, Field, fieldInputCn } from "@/features/quick-capture/capture-page";
import { remindersStore, useReminder } from "@/features/reminders/use-reminders";

export const Route = createFileRoute("/reminders/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Reminder — D2D AI" },
      { name: "description", content: "Update your reminder." },
      { property: "og:title", content: "Edit Reminder — D2D AI" },
      { property: "og:description", content: "Update your reminder." },
    ],
  }),
  component: EditReminder,
});

function EditReminder() {
  const { id } = Route.useParams();
  const reminder = useReminder(id);
  const router = useRouter();
  const [form, setForm] = useState(() =>
    reminder ? { title: reminder.title, date: reminder.date, time: reminder.time } : null,
  );
  if (!reminder) throw notFound();
  if (!form) return null;
  const initial = { title: reminder.title, date: reminder.date, time: reminder.time };
  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);

  const save = () => {
    if (!form.title.trim()) return;
    remindersStore.update(reminder.id, {
      title: form.title.trim(),
      date: form.date,
      time: form.time,
    });
    toast.success("Reminder updated");
    setTimeout(() => {
      if (window.history.length > 1) router.history.back();
      else router.navigate({ to: "/reminders/$id", params: { id: reminder.id } });
    }, 100);
  };

  return (
    <CapturePage
      eyebrow="Edit"
      title="Reminder"
      isDirty={isDirty}
      saveDisabled={!form.title.trim()}
      onSave={save}
      saveLabel="Save"
    >
      <div className="space-y-6">
        <Field label="Reminder title" required>
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
      </div>
    </CapturePage>
  );
}
