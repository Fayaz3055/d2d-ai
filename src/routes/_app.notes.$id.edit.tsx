import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CapturePage, Field, fieldInputCn } from "@/features/quick-capture/capture-page";
import { notesStore, useNote } from "@/features/notes/use-notes";

export const Route = createFileRoute("/_app/notes/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Note — D2D AI" },
      { name: "description", content: "Refine and update your note." },
      { property: "og:title", content: "Edit Note — D2D AI" },
      { property: "og:description", content: "Update your note." },
    ],
  }),
  component: EditNote,
});

function EditNote() {
  const { id } = Route.useParams();
  const note = useNote(id);
  const router = useRouter();
  const [form, setForm] = useState(() =>
    note ? { title: note.title, body: note.body } : null,
  );
  if (!note) throw notFound();
  if (!form) return null;

  const initial = { title: note.title, body: note.body };
  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);
  const hasContent = form.title.trim() || form.body.trim();

  const save = () => {
    if (!hasContent) return;
    notesStore.update(note.id, { title: form.title.trim(), body: form.body.trim() });
    toast.success("Note updated");
    setTimeout(() => {
      if (window.history.length > 1) router.history.back();
      else router.navigate({ to: "/notes/$id", params: { id: note.id } });
    }, 100);
  };

  return (
    <CapturePage
      eyebrow="Edit"
      title="Note"
      isDirty={isDirty}
      saveDisabled={!hasContent}
      onSave={save}
      saveLabel="Save"
    >
      <div className="space-y-6">
        <Field label="Title" hint="Optional">
          <input
            autoFocus
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={`${fieldInputCn} text-lg font-semibold`}
          />
        </Field>
        <Field label="Note">
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={16}
            className={`${fieldInputCn} min-h-[320px] resize-none leading-relaxed`}
          />
        </Field>
      </div>
    </CapturePage>
  );
}
