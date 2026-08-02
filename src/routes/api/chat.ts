import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import { AI_MODEL, AI_SYSTEM_PROMPT, createAiGateway } from "@/lib/ai-gateway.server";
import { requireUser } from "@/lib/supabase-user.server";
import { MEMORY_KINDS, formatMemories, loadMemories, saveMemory } from "@/features/ai/memory.server";

const proposalSchema = z.object({
  items: z.array(
    z.object({
      kind: z.enum(["task", "note", "thought", "event", "reminder"]),
      title: z.string(),
      details: z.string().nullable(),
      date: z.string().nullable(),
      time: z.string().nullable(),
      priority: z.enum(["low", "medium", "high"]).nullable(),
      category: z.enum(["study", "personal", "work", "health", "other"]).nullable(),
      tag: z.string().nullable(),
    }),
  ),
});

const memorySchema = z.object({
  kind: z.enum(MEMORY_KINDS),
  label: z.string(),
  text: z.string(),
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireUser(request);
        if (!auth) return new Response("Unauthorized", { status: 401 });

        let messages: UIMessage[] = [];
        let lifeContext: string | null = null;
        try {
          const body = (await request.json()) as { messages?: UIMessage[]; context?: unknown };
          if (!Array.isArray(body.messages)) {
            return new Response("Messages are required", { status: 400 });
          }
          messages = body.messages;
          if (typeof body.context === "string" && body.context.length < 8000) {
            lifeContext = body.context;
          }
        } catch {
          return new Response("Invalid request body", { status: 400 });
        }

        try {
          const memories = await loadMemories(auth.client, 40);
          const system = [
            AI_SYSTEM_PROMPT,
            `\nLong-term memory about this user (reference it naturally when it helps, never list it back verbatim):\n${formatMemories(memories)}`,
            lifeContext
              ? `\nLive snapshot of the user's day (JSON, use for grounded answers — never invent items that aren't here):\n${lifeContext}`
              : "",
          ].join("\n");

          const gateway = createAiGateway();
          const result = streamText({
            model: gateway.responses(AI_MODEL),
            system,
            messages: await convertToModelMessages(messages),
            stopWhen: stepCountIs(50),
            providerOptions: { openai: { store: false } },
            tools: {
              propose_captures: tool({
                description:
                  "Propose tasks, notes, thoughts, events or reminders detected in the user's message. The user confirms before anything is saved.",
                inputSchema: proposalSchema,
                execute: async (input) => input,
              }),
              remember: tool({
                description:
                  "Store ONE durable fact worth remembering for months: a goal, project, learning plan, preference, important date or recurring habit. Never store small talk, task details or one-off chatter.",
                inputSchema: memorySchema,
                execute: async (input) => saveMemory(auth.client, input),
              }),
            },
          });

          return result.toUIMessageStreamResponse({ originalMessages: messages });
        } catch (error) {
          const message = error instanceof Error ? error.message : "AI request failed";
          console.error("[api/chat]", message);
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
