import { useCallback, useEffect, useState } from "react";
import type { UIMessage } from "ai";
import { supabase } from "@/integrations/supabase/client";
import type { AiMessageRow } from "./types";

const TABLE = "ai_messages";

function rowToMessage(row: AiMessageRow): UIMessage {
  const meta = (row.metadata ?? {}) as { parts?: UIMessage["parts"] };
  return {
    id: row.id,
    role: row.role,
    parts:
      Array.isArray(meta.parts) && meta.parts.length > 0
        ? meta.parts
        : [{ type: "text", text: row.content }],
  } as UIMessage;
}

function messageText(message: UIMessage): string {
  return message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

/**
 * One ongoing conversation per user, persisted in the cloud.
 * Loads history once, then appends each completed message.
 */
export function useAiHistory() {
  const [history, setHistory] = useState<UIMessage[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select("id, role, content, metadata, created_at")
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error("[ai] history load failed", error);
        setHistory([]);
        return;
      }
      setHistory(((data ?? []) as unknown as AiMessageRow[]).map(rowToMessage));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (message: UIMessage) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase.from(TABLE).insert({
      user_id: auth.user.id,
      role: message.role === "assistant" ? "assistant" : "user",
      content: messageText(message),
      metadata: { parts: message.parts } as never,
    } as never);
    if (error) console.error("[ai] message save failed", error);
  }, []);

  const clearHistory = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase.from(TABLE).delete().eq("user_id", auth.user.id);
    if (error) {
      console.error("[ai] history clear failed", error);
      return;
    }
    setHistory([]);
  }, []);

  return { history, persist, clearHistory };
}
