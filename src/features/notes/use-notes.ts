import { createCloudStore, type BaseItem } from "@/features/storage/create-cloud-store";

export type Note = BaseItem & {
  title: string;
  body: string;
};

const { store, useAll, useOne } = createCloudStore<Note>("notes", {
  fromRow: (r) => ({
    id: String(r.id),
    title: (r.title as string) ?? "",
    body: (r.body as string) ?? "",
    createdAt: new Date(r.created_at as string).getTime(),
    updatedAt: new Date(r.updated_at as string).getTime(),
  }),
  toRow: (p) => {
    const row: Record<string, unknown> = {};
    if (p.title !== undefined) row.title = p.title;
    if (p.body !== undefined) row.body = p.body;
    return row;
  },
});

export const notesStore = store;
export const useNotes = useAll;
export const useNote = useOne;
