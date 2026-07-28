import { createCloudStore, type BaseItem } from "@/features/storage/create-cloud-store";

export type CalendarEvent = BaseItem & {
  title: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  notes: string;
};

const { store, useAll, useOne } = createCloudStore<CalendarEvent>("events", {
  fromRow: (r) => ({
    id: String(r.id),
    title: (r.title as string) ?? "",
    date: (r.event_date as string) ?? "",
    time: (r.event_time as string) ?? "",
    notes: (r.notes as string) ?? "",
    createdAt: new Date(r.created_at as string).getTime(),
    updatedAt: new Date(r.updated_at as string).getTime(),
  }),
  toRow: (p) => {
    const row: Record<string, unknown> = {};
    if (p.title !== undefined) row.title = p.title;
    if (p.date !== undefined) row.event_date = p.date;
    if (p.time !== undefined) row.event_time = p.time;
    if (p.notes !== undefined) row.notes = p.notes;
    return row;
  },
});

export const eventsStore = store;
export const useEvents = useAll;
export const useEvent = useOne;

export function eventTimestamp(e: Pick<CalendarEvent, "date" | "time">): number {
  if (!e.date) return Number.POSITIVE_INFINITY;
  const iso = `${e.date}T${e.time || "00:00"}:00`;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}
