import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CapturePage, Field, fieldInputCn } from "@/features/quick-capture/capture-page";
import { thoughtsStore, useThought } from "@/features/thoughts/use-thoughts";

export const Route = createFileRoute("/thoughts/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Thought — D2D AI" },
      { name: "description", content: "Refine your thought." },
      { property: "og:title", content: "Edit Thought — D2D AI" },
      { property: "og:description", content: "Refine your thought." },
    ],
  }),
  component: EditThought,
});

function EditThought() {
  const { id } = Route.useParams();
  const thought = useThought(id);
  const router = useRouter();
  const [form, setForm] = useState(() =>
    thought ? { thought: thought.thought, tag: thought.tag } : null,
  );
  if (!thought) throw notFound();
  if (!form) return null;
  const initial = { thought: thought.thought, tag: thought.tag };
  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);

  const save = () => {
    if (!form.thought.trim()) return;
    thoughtsStore.update(thought.id, {
      thought: form.thought.trim(),
      tag: form.tag.trim(),
    });
    toast.success("Thought updated");
    setTimeout(() => {
      if (window.history.length > 1) router.history.back();
      else router.navigate({ to: "/thoughts/$id", params: { id: thought.id } });
    }, 100);
  };

  return (
    <CapturePage
      eyebrow="Edit"
      title="Thought"
      isDirty={isDirty}
      saveDisabled={!form.thought.trim()}
      onSave={save}
      saveLabel="Save"
    >
      <div className="space-y-6">
        <Field label="Thought" required>
          <textarea
            autoFocus
            value={form.thought}
            onChange={(e) => setForm({ ...form, thought: e.target.value })}
            rows={8}
            className={`${fieldInputCn} min-h-[200px] resize-none text-[17px] leading-relaxed`}
          />
        </Field>
        <Field label="Tag" hint="Optional">
          <input
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
            className={fieldInputCn}
          />
        </Field>
      </div>
    </CapturePage>
  );
}
