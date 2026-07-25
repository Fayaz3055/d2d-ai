import { createCollectionStore, type BaseItem } from "@/features/storage/create-collection-store";

export type Note = BaseItem & {
  title: string;
  body: string;
};

const { store, useAll, useOne } = createCollectionStore<Note>("d2d.notes.v1");

export const notesStore = store;
export const useNotes = useAll;
export const useNote = useOne;
