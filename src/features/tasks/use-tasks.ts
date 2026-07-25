import { useSyncExternalStore } from "react";
import type { Task, TaskInput } from "./types";
import { notificationsStore } from "@/features/notifications/use-notifications";

const STORAGE_KEY = "d2d.tasks.v1";

function loadInitial(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Task[]) : [];
  } catch {
    return [];
  }
}

let tasks: Task[] = loadInitial();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* noop */
  }
  listeners.forEach((l) => l());
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const tasksStore = {
  getAll: () => tasks,
  get: (id: string) => tasks.find((t) => t.id === id),
  add(input: TaskInput): Task {
    const now = Date.now();
    const task: Task = {
      id: uid(),
      completed: false,
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    tasks = [task, ...tasks];
    persist();
    return task;
  },
  update(id: string, patch: Partial<Task>) {
    tasks = tasks.map((t) =>
      t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t,
    );
    persist();
  },
  toggle(id: string) {
    let justCompleted: Task | null = null;
    tasks = tasks.map((t) => {
      if (t.id !== id) return t;
      const nextCompleted = !t.completed;
      const updated: Task = {
        ...t,
        completed: nextCompleted,
        completedAt: nextCompleted ? Date.now() : undefined,
        updatedAt: Date.now(),
      };
      if (nextCompleted) justCompleted = updated;
      return updated;
    });
    persist();
    if (justCompleted) {
      notificationsStore.push({
        kind: "task_completed",
        title: "Task completed",
        description: (justCompleted as Task).title,
      });
    }
  },
  remove(id: string) {
    tasks = tasks.filter((t) => t.id !== id);
    persist();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useTasks(): Task[] {
  return useSyncExternalStore(
    tasksStore.subscribe,
    () => tasks,
    () => [] as Task[],
  );
}

export function useTask(id: string): Task | undefined {
  const all = useTasks();
  return all.find((t) => t.id === id);
}
