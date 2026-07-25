import { createCollectionStore, type BaseItem } from "@/features/storage/create-collection-store";

export type Reminder = BaseItem & {
  title: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  done?: boolean;
};

const { store, useAll, useOne } = createCollectionStore<Reminder>("d2d.reminders.v1");

export const remindersStore = store;
export const useReminders = useAll;
export const useReminder = useOne;

export function reminderTimestamp(r: Pick<Reminder, "date" | "time">): number {
  if (!r.date) return Number.POSITIVE_INFINITY;
  const iso = `${r.date}T${r.time || "00:00"}:00`;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}
