import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CapturePage, Field, fieldInputCn } from "@/features/quick-capture/capture-page";
import { AiSuggestionCard } from "@/features/ai/components/ai-suggestion-card";
import { useDraft } from "@/features/quick-capture/use-draft";
import { thoughtsStore, useThoughts } from "@/features/thoughts/use-thoughts";
import { analyzeThought } from "@/features/thoughts/thought-ai.functions";
import { logThoughtEvent } from "@/features/thoughts/timeline";
import {
  CATEGORY_META,
  THOUGHT_CATEGORIES,
  similarity,
  type ThoughtCategory,
} from "@/features/thoughts/categories";
import { announceCapture } from "@/features/ai/capture-reply";
import { avatarStore } from "@/features/ai/avatar/avatar-store";

export const Route = createFileRoute("/capture/thought")({
  head: () => ({
    meta: [
      { title: "New Thought — D2D AI" },
      { name: "description", content: "Drop a thought — D2D AI understands it and helps it grow." },
      { property: "og:title", content: "New Thought — D2D AI" },
      { property: "og:description", content: "Signature Thought Inbox." },
    ],
  }),
  component: NewThoughtPage,
});

type ThoughtDraft = { thought: string; tag: string; category: ThoughtCategory | "" };
const INITIAL: ThoughtDraft = { thought: "", tag: "", category: "" };

function NewThoughtPage() {
  const router = useRouter();
  const { data, update, clear, isDirty } = useDraft<ThoughtDraft>("thought", INITIAL);
  const analyze = useServerFn(analyzeThought);
  const all = useThoughts();

  const related = data.thought.trim()
    ? all.filter((t) => !t.mergedInto && similarity(t.thought, data.thought) >= 0.34)
    : [];

  const handleSave = () => {
    const text = data.thought.trim();
    if (!text) return;
    const created = thoughtsStore.add({
      thought: text,
      tag: data.tag.trim(),
      category: (data.category || "random") as ThoughtCategory,
    });
    announceCapture({ kind: "thought", title: text, details: data.tag });
    clear();
    toast.success("Thought saved.", {
      description: "D2D AI is reading it — I'll tell you what I think in a second.",
      icon: <Sparkles className="h-4 w-4 text-primary" />,
      duration: 3200,
    });

    // Classify and reply in the background; the thought is already stored.
    void analyze({
      data: {
        text,
        tag: data.tag.trim() || null,
        related: related.slice(0, 5).map((t) => t.thought.slice(0, 300)),
      },
    })
      .then((result) => {
        const category = (
          THOUGHT_CATEGORIES.includes(result.category as ThoughtCategory)
            ? result.category
            : data.category || "random"
        ) as ThoughtCategory;
        thoughtsStore.update(created.id, {
          category: data.category ? (data.category as ThoughtCategory) : category,
          aiReply: result.reply ?? "",
        });
        if (result.reply) avatarStore.speak(result.reply, "thinking", 9000);
        void logThoughtEvent(created.id, "created", text.slice(0, 200));
        void logThoughtEvent(created.id, "classified", CATEGORY_META[category].label);
      })
      .catch(() => {
        void logThoughtEvent(created.id, "created", text.slice(0, 200));
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
            Don't overthink it. Capture the thought — D2D AI will understand it, categorise it and
            help it grow into a plan.
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

        {related.length ? (
          <div className="animate-fade-up rounded-2xl border border-primary/25 bg-primary/[0.06] p-4 text-[13px]">
            You already have {related.length} related idea{related.length > 1 ? "s" : ""}. You can
            merge them from the thought page after saving.
          </div>
        ) : null}

        <Field label="Category" hint="Optional — D2D AI decides if you leave it">
          <select
            value={data.category}
            onChange={(e) => update("category", e.target.value as ThoughtCategory | "")}
            className={fieldInputCn}
          >
            <option value="">Let D2D AI choose</option>
            {THOUGHT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
              </option>
            ))}
          </select>
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
