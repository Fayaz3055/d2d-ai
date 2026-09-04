import { createFileRoute, Link } from "@tanstack/react-router";
import { StickyNote, Plus } from "lucide-react";
import { PageShell } from "@/components/nova/page-shell";
import { EmptyState } from "@/components/nova/empty-state";
import { useNotes } from "@/features/notes/use-notes";
import { quickCapture } from "@/features/quick-capture/quick-capture-store";

export const Route = createFileRoute("/_app/notes")({
  head: () => ({
    meta: [
      { title: "Notes — D2D AI" },
      { name: "description", content: "All your captured notes in one calm place." },
      { property: "og:title", content: "Notes — D2D AI" },
      { property: "og:description", content: "All your notes." },
    ],
  }),
  component: NotesList,
});

function NotesList() {
  const notes = [...useNotes()].sort((a, b) => b.createdAt - a.createdAt);
  return (
    <PageShell eyebrow="Library" title="Notes">
      {notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Capture a longer idea and it'll live here."
        />
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id}>
              <Link to="/notes/$id" params={{ id: n.id }} className="nova-card block p-4">
                <p className="truncate text-[15px] font-semibold tracking-tight">
                  {n.title || "Untitled"}
                </p>
                {n.body ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {n.body}
                  </p>
                ) : null}
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
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
        <Plus className="h-4 w-4" strokeWidth={2.6} /> New Note
      </button>
    </PageShell>
  );
}
