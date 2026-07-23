import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { CapturePage, Field, fieldInputCn } from "@/features/quick-capture/capture-page";
import { useDraft } from "@/features/quick-capture/use-draft";

export const Route = createFileRoute("/capture/event")({
  head: () => ({
    meta: [
      { title: "New Event — D2D AI" },
      { name: "description", content: "Add an event with date, time, and notes." },
      { property: "og:title", content: "New Event — D2D AI" },
      { property: "og:description", content: "Add to your calendar." },
    ],
  }),
  component: NewEventPage,
});

type EventDraft = { title: string; date: string; time: string; notes: string };
const INITIAL: EventDraft = { title: "", date: "", time: "", notes: "" };

function NewEventPage() {
  const router = useRouter();
  const { data, update, clear, isDirty } = useDraft<EventDraft>("event", INITIAL);

  const handleSave = () => {
    if (!data.title.trim()) return;
    clear();
    toast.success("Event added", { description: "Saved to your calendar." });
    setTimeout(() => {
      if (window.history.length > 1) router.history.back();
      else router.navigate({ to: "/calendar" });
    }, 120);
  };

  return (
    <CapturePage
      eyebrow="Quick Capture"
      title="New Event"
      isDirty={isDirty}
      saveDisabled={!data.title.trim()}
      onSave={handleSave}
    >
      <div className="space-y-6">
        <Field label="Event title" required>
          <input
            autoFocus
            value={data.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="What's happening?"
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

        <Field label="Notes" hint="Optional">
          <textarea
            value={data.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Location, guests, agenda…"
            rows={5}
            className={`${fieldInputCn} resize-none leading-relaxed`}
          />
        </Field>
      </div>
    </CapturePage>
  );
}
