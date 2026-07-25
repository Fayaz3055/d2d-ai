import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Plus } from "lucide-react";
import { PageShell } from "@/components/nova/page-shell";
import { EmptyState } from "@/components/nova/empty-state";
import { useThoughts } from "@/features/thoughts/use-thoughts";
import { quickCapture } from "@/features/quick-capture/quick-capture-store";

export const Route = createFileRoute("/thoughts")({
  head: () => ({
    meta: [
      { title: "Thought Inbox — D2D AI" },
      { name: "description", content: "Every thought you captured, ready when you are." },
      { property: "og:title", content: "Thought Inbox — D2D AI" },
      { property: "og:description", content: "Your thought inbox." },
    ],
  }),
  component: ThoughtsList,
});

function ThoughtsList() {
  const thoughts = [...useThoughts()].sort((a, b) => b.createdAt - a.createdAt);
  return (
    <PageShell eyebrow="Inbox" title="Thoughts">
      {thoughts.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No thoughts captured yet"
          description="Drop a fleeting idea — D2D AI will remember it for you."
        />
      ) : (
        <ul className="space-y-2">
          {thoughts.map((t) => (
            <li key={t.id}>
              <Link to="/thoughts/$id" params={{ id: t.id }} className="nova-card block p-4">
                <p className="line-clamp-3 text-sm leading-relaxed">{t.thought}</p>
                <div className="mt-2 flex items-center justify-between">
                  {t.tag ? (
                    <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {t.tag}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => quickCapture.open()}
        className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition-all hover:opacity-95 active:scale-95"
      >
        <Plus className="h-4 w-4" strokeWidth={2.6} /> New Thought
      </button>
    </PageShell>
  );
}
