import { createCollectionStore, type BaseItem } from "@/features/storage/create-collection-store";

export type CalendarEvent = BaseItem & {
  title: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  notes: string;
};

const { store, useAll, useOne } = createCollectionStore<CalendarEvent>("d2d.events.v1");

export const eventsStore = store;
export const useEvents = useAll;
export const useEvent = useOne;

export function eventTimestamp(e: Pick<CalendarEvent, "date" | "time">): number {
  if (!e.date) return Number.POSITIVE_INFINITY;
  const iso = `${e.date}T${e.time || "00:00"}:00`;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}
