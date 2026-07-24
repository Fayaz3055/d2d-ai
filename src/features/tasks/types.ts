export type Priority = "low" | "medium" | "high";
export type Category = "study" | "personal" | "work" | "health" | "other";

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string; // yyyy-mm-dd or ""
  priority: Priority;
  category: Category;
  completed: boolean;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
};

export type TaskInput = Omit<Task, "id" | "completed" | "createdAt" | "updatedAt" | "completedAt">;

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  study: "Study",
  personal: "Personal",
  work: "Work",
  health: "Health",
  other: "Other",
};
