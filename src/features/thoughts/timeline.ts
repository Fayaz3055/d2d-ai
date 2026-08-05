import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Per-thought history: how an idea evolved from capture to completion.
 * Stored in `thought_events` so the timeline survives across devices.
 */
export const TIMELINE_KINDS = [
  "created",
  "classified",
  "expanded",
  "summarized",
  "goal",
  "project",
  "tasks",
  "reminder",
  "event",
  "merged",
  "completed",
] as const;

export type TimelineKind = (typeof TIMELINE_KINDS)[number];

export const TIMELINE_LABEL: Record<TimelineKind, string> = {
  created: "Idea created",
  classified: "Understood by D2D AI",
  expanded: "Expanded",
  summarized: "Summarized",
  goal: "Converted to goal",
  project: "Project created",
  tasks: "Tasks created",
  reminder: "Reminder created",
  event: "Event created",
  merged: "Merged with related ideas",
  completed: "Completed",
};

export type ThoughtEvent = {
  id: string;
  kind: TimelineKind;
  detail: string;
  createdAt: number;
};

/** Appends one timeline entry. Temp (optimistic) ids are skipped safely. */
export async function logThoughtEvent(
  thoughtId: string,
  kind: TimelineKind,
  detail = "",
): Promise<void> {
  if (!thoughtId || thoughtId.startsWith("tmp_")) return;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  const { error } = await supabase
    .from("thought_events")
    .insert({ thought_id: thoughtId, kind, detail, user_id: auth.user.id } as never);
  if (error) console.error("[thought-events] insert failed", error);
}

export function useThoughtTimeline(thoughtId: string) {
  const [events, setEvents] = useState<ThoughtEvent[] | null>(null);

  const load = useCallback(async () => {
    if (!thoughtId || thoughtId.startsWith("tmp_")) {
      setEvents([]);
      return;
    }
    const { data, error } = await supabase
      .from("thought_events")
      .select("id, kind, detail, created_at")
      .eq("thought_id", thoughtId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[thought-events] load failed", error);
      setEvents([]);
      return;
    }
    setEvents(
      (data ?? []).map((r) => ({
        id: String(r.id),
        kind: (r.kind as TimelineKind) ?? "created",
        detail: r.detail ?? "",
        createdAt: new Date(r.created_at as string).getTime(),
      })),
    );
  }, [thoughtId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { events, reload: load };
}
