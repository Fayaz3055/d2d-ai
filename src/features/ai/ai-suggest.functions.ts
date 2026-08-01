import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AI_MODEL, createAiGateway } from "@/lib/ai-gateway.server";

const Input = z.object({
  kind: z.enum(["task", "note", "thought", "event"]),
  text: z.string().min(3).max(2000),
});

const PROMPTS: Record<string, string> = {
  task: "The user is creating a task. Offer one short, optional suggestion for making it easier to finish (e.g. breaking it into study sessions).",
  note: "The user is writing a note. Offer one short, optional suggestion for what to do with it next.",
  thought:
    "The user is capturing a thought or feeling. Offer one short, warm, optional suggestion (journal it, or turn it into an action plan).",
  event:
    "The user is creating an event. Offer one short, optional suggestion (e.g. adding a reminder shortly before it).",
};

/** Returns a single-sentence, optional AI suggestion for a capture draft. */
export const suggestForCapture = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    try {
      const gateway = createAiGateway();
      const result = streamText({
        model: gateway.responses(AI_MODEL),
        system:
          "You are D2D AI, a calm productivity companion. Reply with ONE friendly question or suggestion, under 20 words, no markdown, no quotes.",
        prompt: `${PROMPTS[data.kind]}\n\nDraft: ${data.text}`,
        providerOptions: { openai: { store: false } },
      });
      const text = (await result.text).trim();
      return { suggestion: text.slice(0, 240) };
    } catch (error) {
      console.error("[ai] suggestion failed", error);
      return { suggestion: "" };
    }
  });
