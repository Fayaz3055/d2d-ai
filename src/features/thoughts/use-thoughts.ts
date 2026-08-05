import { createCloudStore, type BaseItem } from "@/features/storage/create-cloud-store";
import type { ThoughtCategory, ThoughtStatus } from "./categories";

export type Thought = BaseItem & {
  thought: string;
  tag: string;
  category: ThoughtCategory;
  aiReply: string;
  status: ThoughtStatus;
  mergedInto: string | null;
};

const { store, useAll, useOne } = createCloudStore<Thought>("thoughts", {
  fromRow: (r) => ({
    id: String(r.id),
    thought: (r.thought as string) ?? "",
    tag: (r.tag as string) ?? "",
    category: ((r.category as ThoughtCategory) ?? "random") as ThoughtCategory,
    aiReply: (r.ai_reply as string) ?? "",
    status: ((r.status as ThoughtStatus) ?? "idea") as ThoughtStatus,
    mergedInto: (r.merged_into as string) ?? null,
    createdAt: new Date(r.created_at as string).getTime(),
    updatedAt: new Date(r.updated_at as string).getTime(),
  }),
  toRow: (p) => {
    const row: Record<string, unknown> = {};
    if (p.thought !== undefined) row.thought = p.thought;
    if (p.tag !== undefined) row.tag = p.tag;
    if (p.category !== undefined) row.category = p.category;
    if (p.aiReply !== undefined) row.ai_reply = p.aiReply;
    if (p.status !== undefined) row.status = p.status;
    if (p.mergedInto !== undefined) row.merged_into = p.mergedInto;
    return row;
  },
});

export const thoughtsStore = store;
export const useThoughts = useAll;
export const useThought = useOne;

/** Thoughts still living on their own (merged ones are folded into a parent). */
export function useActiveThoughts() {
  return useThoughts().filter((t) => !t.mergedInto);
}
