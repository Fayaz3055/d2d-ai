import { createCloudStore, type BaseItem } from "@/features/storage/create-cloud-store";

export type Project = BaseItem & {
  title: string;
  description: string;
  status: string;
  sourceThoughtId: string | null;
};

const { store, useAll, useOne } = createCloudStore<Project>("projects", {
  fromRow: (r) => ({
    id: String(r.id),
    title: (r.title as string) ?? "",
    description: (r.description as string) ?? "",
    status: (r.status as string) ?? "active",
    sourceThoughtId: (r.source_thought_id as string) ?? null,
    createdAt: new Date(r.created_at as string).getTime(),
    updatedAt: new Date(r.updated_at as string).getTime(),
  }),
  toRow: (p) => {
    const row: Record<string, unknown> = {};
    if (p.title !== undefined) row.title = p.title;
    if (p.description !== undefined) row.description = p.description;
    if (p.status !== undefined) row.status = p.status;
    if (p.sourceThoughtId !== undefined) row.source_thought_id = p.sourceThoughtId;
    return row;
  },
});

export const projectsStore = store;
export const useProjects = useAll;
export const useProject = useOne;
