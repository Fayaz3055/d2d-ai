import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  CapturePage,
  ChipRow,
  Field,
  fieldInputCn,
} from "@/features/quick-capture/capture-page";
import { AiSuggestionCard } from "@/features/ai/components/ai-suggestion-card";
import { useDraft } from "@/features/quick-capture/use-draft";
import { tasksStore } from "@/features/tasks/use-tasks";

export const Route = createFileRoute("/capture/task")({
  head: () => ({
    meta: [
      { title: "New Task — D2D AI" },
      { name: "description", content: "Capture a new task with due date, priority, and category." },
      { property: "og:title", content: "New Task — D2D AI" },
      { property: "og:description", content: "Capture a task in seconds." },
    ],
  }),
  component: NewTaskPage,
});

type Priority = "low" | "medium" | "high";
type Category = "study" | "personal" | "work" | "health" | "other";

type TaskDraft = {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  category: Category;
};

const INITIAL: TaskDraft = {
  title: "",
  description: "",
  dueDate: "",
  priority: "medium",
  category: "personal",
};

function NewTaskPage() {
  const router = useRouter();
  const { data, update, clear, isDirty } = useDraft<TaskDraft>("task", INITIAL);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!data.title.trim() || saving) return;
    setSaving(true);
    tasksStore.add({
      title: data.title.trim(),
      description: data.description.trim(),
      dueDate: data.dueDate,
      priority: data.priority,
      category: data.category,
    });
    clear();
    toast.success("Task saved", { description: "Added to your task list." });
    setTimeout(() => {
      if (window.history.length > 1) router.history.back();
      else router.navigate({ to: "/tasks" });
    }, 120);
  };

  return (
    <CapturePage
      eyebrow="Quick Capture"
      title="New Task"
      isDirty={isDirty}
      saveDisabled={!data.title.trim()}
      onSave={handleSave}
    >
      <div className="space-y-6">
        <Field label="Title" required>
          <input
            autoFocus
            value={data.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="What needs doing?"
            className={fieldInputCn}
          />
        </Field>

        <Field label="Description" hint="Optional">
          <textarea
            value={data.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Add details, links, or context…"
            rows={4}
            className={`${fieldInputCn} resize-none leading-relaxed`}
          />
        </Field>

        <Field label="Due date" hint="Optional">
          <input
            type="date"
            value={data.dueDate}
            onChange={(e) => update("dueDate", e.target.value)}
            className={fieldInputCn}
          />
        </Field>

        <Field label="Priority">
          <ChipRow<Priority>
            value={data.priority}
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
            value={data.category}
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

        <AiSuggestionCard kind="task" text={data.title} />
      </div>
    </CapturePage>
  );
}
