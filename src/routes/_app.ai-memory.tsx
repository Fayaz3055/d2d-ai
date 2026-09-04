import { createFileRoute } from "@tanstack/react-router";
import { Brain, Trash2 } from "lucide-react";
import { PageShell } from "@/components/nova/page-shell";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { MEMORY_KIND_LABELS, useMemories } from "@/features/ai/use-memories";

export const Route = createFileRoute("/ai-memory")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "AI Memory — D2D AI" },
      {
        name: "description",
        content: "See and manage the goals, projects and preferences your AI companion remembers.",
      },
      { property: "og:title", content: "AI Memory — D2D AI" },
      {
        property: "og:description",
        content: "What D2D AI remembers about you — always yours to edit.",
      },
    ],
  }),
  component: MemoryPage,
});

function MemoryPage() {
  const { memories, forget } = useMemories();

  return (
    <PageShell eyebrow="AI Companion" title="AI Memory">
      <p className="px-1 text-[13px] leading-relaxed text-muted-foreground">
        Your companion only remembers things with long-term value — goals, projects, learning plans,
        preferences, important dates and habits. Everything here is private to your account.
      </p>

      {!memories ? (
        <Shimmer className="mt-6 text-sm">Loading memory…</Shimmer>
      ) : memories.length === 0 ? (
        <div className="nova-card mt-4 flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Brain className="h-4 w-4" />
          </span>
          <p className="text-sm text-muted-foreground">
            Nothing remembered yet. Mention a goal or project in the AI tab and it'll appear here.
          </p>
        </div>
      ) : (
        <ul className="nova-card mt-4 divide-y divide-border/60 overflow-hidden p-0">
          {memories.map((m) => (
            <li key={m.id} className="flex items-start gap-3 px-3.5 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-primary/30 bg-primary/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                    {MEMORY_KIND_LABELS[m.kind] ?? m.kind}
                  </span>
                  <p className="truncate text-[13px] font-semibold tracking-tight">{m.label}</p>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{m.text}</p>
              </div>
              <button
                type="button"
                aria-label={`Forget ${m.label}`}
                onClick={() => void forget(m.id)}
                className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
