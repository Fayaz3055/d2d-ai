import { createCollectionStore, type BaseItem } from "@/features/storage/create-collection-store";

export type Thought = BaseItem & {
  thought: string;
  tag: string;
};

const { store, useAll, useOne } = createCollectionStore<Thought>("d2d.thoughts.v1");

export const thoughtsStore = store;
export const useThoughts = useAll;
export const useThought = useOne;
