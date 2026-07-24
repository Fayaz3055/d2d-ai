import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CapturePage,
  ChipRow,
  Field,
  fieldInputCn,
} from "@/features/quick-capture/capture-page";
import { tasksStore, useTask } from "@/features/tasks/use-tasks";
import type { Category, Priority } from "@/features/tasks/types";

export const Route = createFileRoute("/tasks/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Task — D2D AI" },
      { name: "description", content: "Update your task details." },
      { property: "og:title", content: "Edit Task — D2D AI" },
      { property: "og:description", content: "Refine and update your task." },
    ],
  }),
  component: EditTaskPage,
});

type Form = {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  category: Category;
};

function EditTaskPage() {
  const { id } = Route.useParams();
  const task = useTask(id);
  const router = useRouter();

  const initial = useMemo<Form | null>(() => {
    if (!task) return null;
    return {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      category: task.category,
    };
  }, [task]);

  const [form, setForm] = useState<Form | null>(initial);
  useEffect(() => {
    if (initial && !form) setForm(initial);
  }, [initial, form]);

  if (!task || !initial) throw notFound();
  if (!form) return null;

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);

  const update = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = () => {
    if (!form.title.trim()) return;
    tasksStore.update(task.id, form);
    toast.success("Task updated");
    setTimeout(() => {
      if (window.history.length > 1) router.history.back();
      else router.navigate({ to: "/tasks/$id", params: { id: task.id } });
    }, 100);
  };

  return (
    <CapturePage
      eyebrow="Edit"
      title={task.title || "Task"}
      isDirty={isDirty}
      saveDisabled={!form.title.trim()}
      onSave={handleSave}
      saveLabel="Save"
    >
      <div className="space-y-6">
        <Field label="Title" required>
          <input
            autoFocus
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className={fieldInputCn}
          />
        </Field>
        <Field label="Description" hint="Optional">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className={`${fieldInputCn} resize-none leading-relaxed`}
          />
        </Field>
        <Field label="Due date" hint="Optional">
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => update("dueDate", e.target.value)}
            className={fieldInputCn}
          />
        </Field>
        <Field label="Priority">
          <ChipRow<Priority>
            value={form.priority}
            onChange={(v) => update("priority", v)}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />
        </Field>
        <Field label="Category">
          <ChipRow<Category>
            value={form.category}
            onChange={(v) => update("category", v)}
            options={[
              { value: "study", label: "Study" },
              { value: "personal", label: "Personal" },
              { value: "work", label: "Work" },
              { value: "health", label: "Health" },
              { value: "other", label: "Other" },
            ]}
          />
        </Field>
      </div>
    </CapturePage>
  );
}
