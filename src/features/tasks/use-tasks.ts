import { createCloudStore } from "@/features/storage/create-cloud-store";
import type { Category, Priority, Task, TaskInput } from "./types";
import { notificationsStore } from "@/features/notifications/use-notifications";
import { announceCompletion } from "@/features/ai/capture-reply";

const { store, useAll, useOne, useLoaded } = createCloudStore<Task>("tasks", {
  fromRow: (r) => ({
    id: String(r.id),
    title: (r.title as string) ?? "",
    description: (r.description as string) ?? "",
    dueDate: (r.due_date as string) ?? "",
    priority: ((r.priority as Priority) ?? "medium") as Priority,
    category: ((r.category as Category) ?? "other") as Category,
    completed: Boolean(r.completed),
    completedAt: r.completed_at ? new Date(r.completed_at as string).getTime() : undefined,
    createdAt: new Date(r.created_at as string).getTime(),
    updatedAt: new Date(r.updated_at as string).getTime(),
  }),
  toRow: (p) => {
    const row: Record<string, unknown> = {};
    if (p.title !== undefined) row.title = p.title;
    if (p.description !== undefined) row.description = p.description;
    if (p.dueDate !== undefined) row.due_date = p.dueDate;
    if (p.priority !== undefined) row.priority = p.priority;
    if (p.category !== undefined) row.category = p.category;
    if (p.completed !== undefined) row.completed = p.completed;
    if ("completedAt" in p)
      row.completed_at = p.completedAt ? new Date(p.completedAt).toISOString() : null;
    return row;
  },
});

export const tasksStore = {
  ...store,
  add(input: TaskInput): Task {
    return store.add({ ...input, completed: false } as Omit<
      Task,
      "id" | "createdAt" | "updatedAt"
    >);
  },
  toggle(id: string) {
    const task = store.get(id);
    if (!task) return;
    const nextCompleted = !task.completed;
    store.update(id, {
      completed: nextCompleted,
      completedAt: nextCompleted ? Date.now() : undefined,
    } as Partial<Task>);
    if (nextCompleted) {
      notificationsStore.push({
        kind: "task_completed",
        title: "Task completed",
        description: task.title,
      });
      announceCompletion(task.title);
    }
  },
};

export const useTasks = useAll;
export const useTasksLoaded = useLoaded;
export const useTask = useOne;
