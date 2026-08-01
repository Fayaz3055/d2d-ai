import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CapturePage, Field, fieldInputCn } from "@/features/quick-capture/capture-page";
import { AiSuggestionCard } from "@/features/ai/components/ai-suggestion-card";
import { useDraft } from "@/features/quick-capture/use-draft";
import { thoughtsStore } from "@/features/thoughts/use-thoughts";

export const Route = createFileRoute("/capture/thought")({
  head: () => ({
    meta: [
      { title: "New Thought — D2D AI" },
      { name: "description", content: "Drop a thought — D2D AI helps you remember it later." },
      { property: "og:title", content: "New Thought — D2D AI" },
      { property: "og:description", content: "Signature Thought Inbox." },
    ],
  }),
  component: NewThoughtPage,
});

type ThoughtDraft = { thought: string; tag: string };
const INITIAL: ThoughtDraft = { thought: "", tag: "" };

function NewThoughtPage() {
  const router = useRouter();
  const { data, update, clear, isDirty } = useDraft<ThoughtDraft>("thought", INITIAL);

  const handleSave = () => {
    if (!data.thought.trim()) return;
    thoughtsStore.add({ thought: data.thought.trim(), tag: data.tag.trim() });
    clear();
    toast.success("Thought saved.", {
      description: "Now get back to what you were doing. I'll help you remember this later.",
      icon: <Sparkles className="h-4 w-4 text-primary" />,
      duration: 3200,
    });
    setTimeout(() => {
      if (window.history.length > 1) router.history.back();
      else router.navigate({ to: "/home" });
    }, 140);
  };

  return (
    <CapturePage
      eyebrow="Thought Inbox"
      title="New Thought"
      isDirty={isDirty}
      saveDisabled={!data.thought.trim()}
      onSave={handleSave}
    >
      <div className="space-y-8">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-accent/60 via-background to-background p-5">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Just get it out
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Don't overthink it. Capture the thought — D2D AI will surface it back to you at
            the right moment.
          </p>
        </div>

        <Field label="Thought" required>
          <textarea
            autoFocus
            value={data.thought}
            onChange={(e) => update("thought", e.target.value)}
            placeholder="What's on your mind?"
            rows={8}
            className={`${fieldInputCn} min-h-[200px] resize-none text-[17px] leading-relaxed`}
          />
        </Field>

        <Field label="Tag" hint="Optional">
          <input
            value={data.tag}
            onChange={(e) => update("tag", e.target.value)}
            placeholder="e.g. idea, question, gratitude"
            className={fieldInputCn}
          />
        </Field>

        <AiSuggestionCard kind="thought" text={data.thought} />
      </div>
    </CapturePage>
  );
}
