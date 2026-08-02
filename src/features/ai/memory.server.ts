import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Long-term AI memory. Only durable, high-value facts belong here:
 * goals, projects, learning plans, preferences, important dates, habits.
 *
 * Extension point: future capabilities (habit intelligence, mood analysis,
 * finance, career coaching) add new kinds here and reuse the same store.
 */
export const MEMORY_KINDS = [
  "goal",
  "project",
  "learning",
  "preference",
  "important_date",
  "habit",
] as const;

export type MemoryKind = (typeof MEMORY_KINDS)[number];

export type MemoryRecord = {
  id: string;
  kind: string;
  label: string;
  text: string;
  updated_at: string;
};

type Row = {
  id: string;
  kind: string;
  label: string;
  content: unknown;
  updated_at: string;
};

function rowToRecord(row: Row): MemoryRecord {
  const content = (row.content ?? {}) as { text?: unknown };
  return {
    id: row.id,
    kind: row.kind,
    label: row.label,
    text: typeof content.text === "string" ? content.text : "",
    updated_at: row.updated_at,
  };
}

/** Loads the most recently touched memories for the signed-in user. */
export async function loadMemories(
  client: SupabaseClient,
  limit = 40,
): Promise<MemoryRecord[]> {
  const { data, error } = await client
    .from("ai_memory")
    .select("id, kind, label, content, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[ai-memory] load failed", error.message);
    return [];
  }
  return ((data ?? []) as unknown as Row[]).map(rowToRecord);
}

/** Renders memories as compact context lines for a system prompt. */
export function formatMemories(records: MemoryRecord[]): string {
  if (records.length === 0) return "No long-term memory saved yet.";
  return records
    .map((m) => `- [${m.kind}] ${m.label}: ${m.text} (updated ${m.updated_at.slice(0, 10)})`)
    .join("\n");
}

/** Upserts one durable fact, keyed by its label so memory never duplicates. */
export async function saveMemory(
  client: SupabaseClient,
  input: { kind: MemoryKind; label: string; text: string },
): Promise<{ saved: boolean }> {
  const label = input.label.trim().slice(0, 120);
  const text = input.text.trim().slice(0, 600);
  if (!label || !text) return { saved: false };

  const { data: existing } = await client
    .from("ai_memory")
    .select("id")
    .eq("label", label)
    .maybeSingle();

  if (existing) {
    const { error } = await client
      .from("ai_memory")
      .update({ kind: input.kind, content: { text } } as never)
      .eq("id", (existing as { id: string }).id);
    if (error) {
      console.error("[ai-memory] update failed", error.message);
      return { saved: false };
    }
    return { saved: true };
  }

  const { error } = await client
    .from("ai_memory")
    .insert({ kind: input.kind, label, content: { text } } as never);
  if (error) {
    console.error("[ai-memory] insert failed", error.message);
    return { saved: false };
  }
  return { saved: true };
}
