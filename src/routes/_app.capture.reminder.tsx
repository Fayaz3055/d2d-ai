import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { CapturePage, Field, fieldInputCn } from "@/features/quick-capture/capture-page";
import { useDraft } from "@/features/quick-capture/use-draft";
import { remindersStore } from "@/features/reminders/use-reminders";
import { announceCapture } from "@/features/ai/capture-reply";

export const Route = createFileRoute("/_app/capture/reminder")({
  head: () => ({
    meta: [
      { title: "New Reminder — D2D AI" },
      { name: "description", content: "Get a nudge at the right time." },
      { property: "og:title", content: "New Reminder — D2D AI" },
      { property: "og:description", content: "Set a reminder in seconds." },
    ],
  }),
  component: NewReminderPage,
});

type ReminderDraft = { title: string; date: string; time: string };
const INITIAL: ReminderDraft = { title: "", date: "", time: "" };

function NewReminderPage() {
  const router = useRouter();
  const { data, update, clear, isDirty } = useDraft<ReminderDraft>("reminder", INITIAL);

  const handleSave = () => {
    if (!data.title.trim()) return;
    remindersStore.add({
      title: data.title.trim(),
      date: data.date,
      time: data.time,
    });
    announceCapture({
      kind: "reminder",
      title: data.title,
      when: `${data.date} ${data.time}`.trim(),
    });
    clear();
    toast.success("Reminder set", { description: "We'll ping you when it's time." });
    setTimeout(() => {
      if (window.history.length > 1) router.history.back();
      else router.navigate({ to: "/home" });
    }, 120);
  };

  return (
    <CapturePage
      eyebrow="Quick Capture"
      title="New Reminder"
      isDirty={isDirty}
      saveDisabled={!data.title.trim()}
      onSave={handleSave}
    >
      <div className="space-y-6">
        <Field label="Reminder title" required>
          <input
            autoFocus
            value={data.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Remind me to…"
            className={fieldInputCn}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input
              type="date"
              value={data.date}
              onChange={(e) => update("date", e.target.value)}
              className={fieldInputCn}
            />
          </Field>
          <Field label="Time">
            <input
              type="time"
              value={data.time}
              onChange={(e) => update("time", e.target.value)}
              className={fieldInputCn}
            />
          </Field>
        </div>
      </div>
    </CapturePage>
  );
}
