import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { CapturePage, Field, fieldInputCn } from "@/features/quick-capture/capture-page";
import { AiSuggestionCard } from "@/features/ai/components/ai-suggestion-card";
import { useDraft } from "@/features/quick-capture/use-draft";
import { notesStore } from "@/features/notes/use-notes";
import { announceCapture } from "@/features/ai/capture-reply";

export const Route = createFileRoute("/capture/note")({
  head: () => ({
    meta: [
      { title: "New Note — D2D AI" },
      { name: "description", content: "Capture a longer note with a title and body." },
      { property: "og:title", content: "New Note — D2D AI" },
      { property: "og:description", content: "Write out an idea in full." },
    ],
  }),
  component: NewNotePage,
});

type NoteDraft = { title: string; body: string };
const INITIAL: NoteDraft = { title: "", body: "" };

function NewNotePage() {
  const router = useRouter();
  const { data, update, clear, isDirty } = useDraft<NoteDraft>("note", INITIAL);

  const hasContent = data.title.trim().length > 0 || data.body.trim().length > 0;

  const handleSave = () => {
    if (!hasContent) return;
    notesStore.add({ title: data.title.trim(), body: data.body.trim() });
    announceCapture({ kind: "note", title: data.title, details: data.body });
    clear();
    toast.success("Note saved", { description: "Tucked away in your notes." });
    setTimeout(() => {
      if (window.history.length > 1) router.history.back();
      else router.navigate({ to: "/home" });
    }, 120);
  };

  return (
    <CapturePage
      eyebrow="Quick Capture"
      title="New Note"
      isDirty={isDirty}
      saveDisabled={!hasContent}
      onSave={handleSave}
    >
      <div className="space-y-6">
        <Field label="Title" hint="Optional">
          <input
            autoFocus
            value={data.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Untitled note"
            className={`${fieldInputCn} text-lg font-semibold`}
          />
        </Field>

        <Field label="Note">
          <textarea
            value={data.body}
            onChange={(e) => update("body", e.target.value)}
            placeholder="Start writing…"
            rows={16}
            className={`${fieldInputCn} min-h-[320px] resize-none leading-relaxed`}
          />
        </Field>

        <AiSuggestionCard kind="note" text={data.title} />
      </div>
    </CapturePage>
  );
}
