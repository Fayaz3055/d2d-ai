import { createFileRoute, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/nova/page-shell";
import { ConfirmDeleteDialog } from "@/components/nova/confirm-delete";
import { thoughtsStore, useThought } from "@/features/thoughts/use-thoughts";

export const Route = createFileRoute("/thoughts/$id")({
  head: () => ({
    meta: [
      { title: "Thought — D2D AI" },
      { name: "description", content: "Thought details." },
      { property: "og:title", content: "Thought — D2D AI" },
      { property: "og:description", content: "Thought details." },
    ],
  }),
  component: ThoughtDetail,
});

function ThoughtDetail() {
  const { id } = Route.useParams();
  const thought = useThought(id);
  const navigate = useNavigate();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  if (!thought) throw notFound();

  const handleDelete = () => {
    thoughtsStore.remove(thought.id);
    toast("Thought deleted");
    if (window.history.length > 1) router.history.back();
    else router.navigate({ to: "/thoughts" });
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
        <div className="mt-5 flex items-center justify-between">
          {thought.tag ? (
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {thought.tag}
            </span>
          ) : (
            <span />
          )}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {new Date(thought.createdAt).toLocaleString()}
          </span>
        </div>
      </article>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/25 bg-background px-4 py-3 text-sm font-semibold text-destructive transition-all hover:bg-destructive/5 active:scale-[0.98]"
      >
        <Trash2 className="h-4 w-4" /> Delete thought
      </button>
      <ConfirmDeleteDialog open={confirm} onOpenChange={setConfirm} onConfirm={handleDelete} />
    </PageShell>
  );
}
