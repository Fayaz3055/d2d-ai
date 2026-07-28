import { createCloudStore, type BaseItem } from "@/features/storage/create-cloud-store";

export type Thought = BaseItem & {
  thought: string;
  tag: string;
};

const { store, useAll, useOne } = createCloudStore<Thought>("thoughts", {
  fromRow: (r) => ({
    id: String(r.id),
    thought: (r.thought as string) ?? "",
    tag: (r.tag as string) ?? "",
    createdAt: new Date(r.created_at as string).getTime(),
    updatedAt: new Date(r.updated_at as string).getTime(),
  }),
  toRow: (p) => {
    const row: Record<string, unknown> = {};
    if (p.thought !== undefined) row.thought = p.thought;
    if (p.tag !== undefined) row.tag = p.tag;
    return row;
  },
});

export const thoughtsStore = store;
export const useThoughts = useAll;
export const useThought = useOne;
