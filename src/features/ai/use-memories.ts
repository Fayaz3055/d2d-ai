import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Memory = {
  id: string;
  kind: string;
  label: string;
  text: string;
  updatedAt: string;
};

type Row = {
  id: string;
  kind: string;
  label: string;
  content: { text?: string } | null;
  updated_at: string;
};

export const MEMORY_KIND_LABELS: Record<string, string> = {
  goal: "Goal",
  project: "Project",
  learning: "Learning",
  preference: "Preference",
  important_date: "Important date",
  habit: "Habit",
  fact: "Note",
};

/** Reads and manages what the companion remembers long-term. */
export function useMemories() {
  const [memories, setMemories] = useState<Memory[] | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("ai_memory")
      .select("id, kind, label, content, updated_at")
      .order("updated_at", { ascending: false });
    if (error) {
      console.error("[ai-memory] load failed", error);
      setMemories([]);
      return;
    }
    setMemories(
      ((data ?? []) as unknown as Row[]).map((r) => ({
        id: r.id,
        kind: r.kind,
        label: r.label,
        text: r.content?.text ?? "",
        updatedAt: r.updated_at,
      })),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const forget = useCallback(async (id: string) => {
    setMemories((prev) => prev?.filter((m) => m.id !== id) ?? prev);
    const { error } = await supabase.from("ai_memory").delete().eq("id", id);
    if (error) console.error("[ai-memory] delete failed", error);
  }, []);

  return { memories, forget, reload: load };
}
