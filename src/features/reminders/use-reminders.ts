import { createCloudStore, type BaseItem } from "@/features/storage/create-cloud-store";

export type Reminder = BaseItem & {
  title: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  done?: boolean;
};

const { store, useAll, useOne } = createCloudStore<Reminder>("reminders", {
  fromRow: (r) => ({
    id: String(r.id),
    title: (r.title as string) ?? "",
    date: (r.remind_date as string) ?? "",
    time: (r.remind_time as string) ?? "",
    done: Boolean(r.done),
    createdAt: new Date(r.created_at as string).getTime(),
    updatedAt: new Date(r.updated_at as string).getTime(),
  }),
  toRow: (p) => {
    const row: Record<string, unknown> = {};
    if (p.title !== undefined) row.title = p.title;
    if (p.date !== undefined) row.remind_date = p.date;
    if (p.time !== undefined) row.remind_time = p.time;
    if (p.done !== undefined) row.done = p.done;
    return row;
  },
});

export const remindersStore = store;
export const useReminders = useAll;
export const useReminder = useOne;

export function reminderTimestamp(r: Pick<Reminder, "date" | "time">): number {
  if (!r.date) return Number.POSITIVE_INFINITY;
  const iso = `${r.date}T${r.time || "00:00"}:00`;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}
