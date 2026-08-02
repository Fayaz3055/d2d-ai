import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  DAILY_SYSTEM,
  REPLY_SYSTEM,
  WEEKLY_SYSTEM,
  replyPrompt,
  runJson,
  runText,
} from "./insights.server";
import { formatMemories, loadMemories } from "./memory.server";

const ContextInput = z.object({ context: z.string().min(2).max(6000) });

const ReplyInput = z.object({
  kind: z.enum(["task", "note", "thought", "event", "reminder"]),
  title: z.string().min(1).max(300),
  details: z.string().max(1200).nullable(),
  when: z.string().max(80).nullable(),
});

export type DailyBriefing = {
  greeting: string;
  plan: string[];
  suggestions: string[];
};

export type WeeklyInsights = {
  summary: string;
  trend: string;
  mostProductiveDay: string;
  priorities: string[];
  encouragement: string;
};

/** Context-aware home greeting + smart daily plan. */
export const getDailyBriefing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ContextInput.parse(data))
  .handler(async ({ data, context }): Promise<DailyBriefing> => {
    const memories = await loadMemories(context.supabase, 20);
    return runJson<DailyBriefing>(
      DAILY_SYSTEM,
      `Long-term memory about this user:\n${formatMemories(memories)}\n\nToday's context (JSON):\n${data.context}`,
      { greeting: "", plan: [], suggestions: [] },
    );
  });

/** Weekly review: completions, trend, best day, next priorities, encouragement. */
export const getWeeklyInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ContextInput.parse(data))
  .handler(async ({ data, context }): Promise<WeeklyInsights> => {
    const memories = await loadMemories(context.supabase, 20);
    return runJson<WeeklyInsights>(
      WEEKLY_SYSTEM,
      `Long-term memory about this user:\n${formatMemories(memories)}\n\nThis week's context (JSON):\n${data.context}`,
      { summary: "", trend: "", mostProductiveDay: "", priorities: [], encouragement: "" },
    );
  });

/** One short AI reply after the user creates any item. */
export const getCaptureReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ReplyInput.parse(data))
  .handler(async ({ data }): Promise<{ reply: string }> => {
    try {
      const text = await runText(REPLY_SYSTEM, replyPrompt(data));
      return { reply: text.replace(/^["']|["']$/g, "").slice(0, 200) };
    } catch (error) {
      console.error("[ai] capture reply failed", error);
      return { reply: "" };
    }
  });
