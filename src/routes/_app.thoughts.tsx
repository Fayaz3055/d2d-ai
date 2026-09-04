import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/nova/page-shell";
import { EmptyState } from "@/components/nova/empty-state";
import { useThoughts } from "@/features/thoughts/use-thoughts";
import { CATEGORY_META, THOUGHT_CATEGORIES, categoryMeta } from "@/features/thoughts/categories";
import { quickCapture } from "@/features/quick-capture/quick-capture-store";
import { queueAiPrompt } from "@/features/ai/pending-prompt";

export const Route = createFileRoute("/_app/thoughts")({
  head: () => ({
    meta: [
      { title: "Thought Inbox — D2D AI" },
      { name: "description", content: "Every idea you captured, categorised and ready to grow." },
      { property: "og:title", content: "Thought Inbox — D2D AI" },
      { property: "og:description", content: "Your intelligent second brain." },
    ],
  }),
  component: ThoughtsList,
});

function ThoughtsList() {
  const all = useThoughts();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const thoughts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((t) => !t.mergedInto)
      .filter((t) => (filter === "all" ? true : t.category === filter))
      .filter((t) =>
        q
          ? `${t.thought} ${t.tag} ${t.category} ${categoryMeta(t.category).label} ${t.aiReply}`
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [all, query, filter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    all.filter((t) => !t.mergedInto).forEach((t) => {
      map[t.category] = (map[t.category] ?? 0) + 1;
    });
    return map;
  }, [all]);

  return (
    <PageShell eyebrow="Second Brain" title="Thoughts">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ideas, goals, journals…"
          className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary/50"
        />
      </div>

      <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
        {(["all", ...THOUGHT_CATEGORIES] as const).map((c) => {
          const active = filter === c;
          const label = c === "all" ? "All" : `${CATEGORY_META[c].emoji} ${CATEGORY_META[c].label}`;
          const count = c === "all" ? undefined : counts[c];
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all active:scale-95 ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {label}
              {count ? ` · ${count}` : ""}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => queueAiPrompt(query.trim() ? query.trim() : "Show all my business ideas")}
        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary"
      >
        <Sparkles className="h-3.5 w-3.5" /> Ask D2D AI about my thoughts
      </button>

      <div className="mt-5">
        {thoughts.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title={query || filter !== "all" ? "Nothing matches yet" : "No thoughts captured yet"}
            description="Drop a fleeting idea — D2D AI will categorise it and help it grow."
          />
        ) : (
          <ul className="space-y-2">
            {thoughts.map((t) => {
              const meta = categoryMeta(t.category);
              return (
                <li key={t.id}>
                  <Link to="/thoughts/$id" params={{ id: t.id }} className="nova-card block p-4">
                    <p className="line-clamp-3 text-sm leading-relaxed">{t.thought}</p>
                    {t.aiReply ? (
                      <p className="mt-1.5 line-clamp-2 text-[12px] text-primary/90">
                        {t.aiReply}
                      </p>
                    ) : null}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {meta.emoji} {meta.label}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
