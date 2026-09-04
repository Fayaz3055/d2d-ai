import { createFileRoute, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/nova/page-shell";
import { ConfirmDeleteDialog } from "@/components/nova/confirm-delete";
import { notesStore, useNote } from "@/features/notes/use-notes";

export const Route = createFileRoute("/notes/$id")({
  head: () => ({
    meta: [
      { title: "Note — D2D AI" },
      { name: "description", content: "Note details." },
      { property: "og:title", content: "Note — D2D AI" },
      { property: "og:description", content: "Note details." },
    ],
  }),
  component: NoteDetail,
});

function NoteDetail() {
  const { id } = Route.useParams();
  const note = useNote(id);
  const navigate = useNavigate();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  if (!note) throw notFound();

  const handleDelete = () => {
    notesStore.remove(note.id);
    toast("Note deleted");
    if (window.history.length > 1) router.history.back();
    else router.navigate({ to: "/notes" });
  };

  return (
    <PageShell
      eyebrow="Note"
      title={note.title || "Untitled"}
      fallbackTo="/notes"
      right={
        <button
          type="button"
          onClick={() => navigate({ to: "/notes/$id/edit", params: { id: note.id } })}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition-all active:scale-95"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      }
    >
      <article className="nova-card p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{note.title || "Untitled"}</h1>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {new Date(note.createdAt).toLocaleString()}
        </p>
        {note.body ? (
          <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
            {note.body}
          </p>
        ) : (
          <p className="mt-5 text-sm italic text-muted-foreground/70">Empty note.</p>
        )}
      </article>

      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/25 bg-background px-4 py-3 text-sm font-semibold text-destructive transition-all hover:bg-destructive/5 active:scale-[0.98]"
      >
        <Trash2 className="h-4 w-4" /> Delete note
      </button>
      <ConfirmDeleteDialog open={confirm} onOpenChange={setConfirm} onConfirm={handleDelete} />
    </PageShell>
  );
}
