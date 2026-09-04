import { createFileRoute, Link, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { Merge, Pencil, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/nova/page-shell";
import { ConfirmDeleteDialog } from "@/components/nova/confirm-delete";
import { thoughtsStore, useThought, useThoughts } from "@/features/thoughts/use-thoughts";
import {
  CATEGORY_META,
  STATUS_LABEL,
  THOUGHT_CATEGORIES,
  categoryMeta,
  similarity,
  type ThoughtCategory,
} from "@/features/thoughts/categories";
import { TIMELINE_LABEL, logThoughtEvent, useThoughtTimeline } from "@/features/thoughts/timeline";
import { ThoughtAiActions } from "@/features/thoughts/thought-ai-actions";

export const Route = createFileRoute("/_app/thoughts/$id")({
  head: () => ({
    meta: [
      { title: "Thought — D2D AI" },
      { name: "description", content: "See how this idea evolved and what D2D AI suggests next." },
      { property: "og:title", content: "Thought — D2D AI" },
      { property: "og:description", content: "Thought details and evolution timeline." },
    ],
  }),
  component: ThoughtDetail,
});

function ThoughtDetail() {
  const { id } = Route.useParams();
  const thought = useThought(id);
  const all = useThoughts();
  const navigate = useNavigate();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const { events, reload } = useThoughtTimeline(id);
  if (!thought) throw notFound();

  const meta = categoryMeta(thought.category);
  const related = all.filter(
    (t) => t.id !== thought.id && !t.mergedInto && similarity(t.thought, thought.thought) >= 0.34,
  );
  const sameTheme = all.filter(
    (t) => !t.mergedInto && t.category === thought.category && t.status !== "project",
  );

  const handleDelete = () => {
    thoughtsStore.remove(thought.id);
    toast("Thought deleted");
    if (window.history.length > 1) router.history.back();
    else router.navigate({ to: "/thoughts" });
  };

  const mergeAll = async () => {
    related.forEach((t) => thoughtsStore.update(t.id, { mergedInto: thought.id }));
    await logThoughtEvent(thought.id, "merged", `${related.length} related ideas`);
    toast.success(`${related.length} idea${related.length > 1 ? "s" : ""} merged here`);
    void reload();
  };

  return (
    <PageShell
      eyebrow="Thought"
      title="Details"
      fallbackTo="/thoughts"
      right={
        <button
          type="button"
          onClick={() => navigate({ to: "/thoughts/$id/edit", params: { id: thought.id } })}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition-all active:scale-95"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      }
    >
      <article className="nova-card p-6">
        <p className="whitespace-pre-wrap text-[17px] leading-relaxed text-foreground">
          {thought.thought}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <select
            aria-label="Category"
            value={thought.category}
            onChange={(e) => {
              const next = e.target.value as ThoughtCategory;
              thoughtsStore.update(thought.id, { category: next });
              void logThoughtEvent(thought.id, "classified", CATEGORY_META[next].label).then(reload);
            }}
            className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary"
          >
            {THOUGHT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
              </option>
            ))}
          </select>
          <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {STATUS_LABEL[thought.status] ?? thought.status}
          </span>
          {thought.tag ? (
            <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {thought.tag}
            </span>
          ) : null}
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {new Date(thought.createdAt).toLocaleString()}
          </span>
        </div>
      </article>

      {thought.aiReply ? (
        <div className="animate-fade-up mt-4 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
            <Sparkles className="h-3.5 w-3.5" /> D2D AI
          </p>
          <p className="mt-1 text-[13px] leading-relaxed">{thought.aiReply}</p>
        </div>
      ) : null}

      {sameTheme.length >= 3 ? (
        <div className="mt-4 rounded-2xl border border-primary/25 bg-card p-4 text-[13px]">
          You've mentioned {meta.label.toLowerCase()} {sameTheme.length} times. Use{" "}
          <span className="font-semibold">Create Project</span> below to turn this theme into a
          project with a goal, notes and tasks.
        </div>
      ) : null}

      <ThoughtAiActions thought={thought} onChanged={reload} />

      {related.length ? (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
              You already have {related.length} related idea{related.length > 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={() => void mergeAll()}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:border-primary/40"
            >
              <Merge className="h-3.5 w-3.5 text-primary" /> Merge here
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {related.map((t) => (
              <li key={t.id}>
                <Link to="/thoughts/$id" params={{ id: t.id }} className="nova-card block p-3">
                  <p className="line-clamp-2 text-[13px] leading-relaxed">{t.thought}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {categoryMeta(t.category).emoji} {categoryMeta(t.category).label}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
          Timeline
        </p>
        {events === null ? (
          <p className="mt-3 text-[13px] text-muted-foreground">Loading history…</p>
        ) : events.length === 0 ? (
          <p className="mt-3 text-[13px] text-muted-foreground">
            Nothing yet — every AI action on this idea will appear here.
          </p>
        ) : (
          <ol className="mt-3 space-y-3 border-l border-border/70 pl-4">
            {events.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                <p className="text-[13px] font-semibold tracking-tight">
                  {TIMELINE_LABEL[e.kind] ?? e.kind}
                </p>
                {e.detail ? (
                  <p className="line-clamp-2 text-[12px] text-muted-foreground">{e.detail}</p>
                ) : null}
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {new Date(e.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/25 bg-background px-4 py-3 text-sm font-semibold text-destructive transition-all hover:bg-destructive/5 active:scale-[0.98]"
      >
        <Trash2 className="h-4 w-4" /> Delete thought
      </button>
      <ConfirmDeleteDialog open={confirm} onOpenChange={setConfirm} onConfirm={handleDelete} />
    </PageShell>
  );
}
