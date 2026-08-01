import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { AI_MODEL, AI_SYSTEM_PROMPT, createAiGateway } from "@/lib/ai-gateway.server";

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

async function getUserId(request: Request): Promise<string | null> {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) return null;

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await getUserId(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });

        let messages: UIMessage[] = [];
        try {
          const body = (await request.json()) as { messages?: UIMessage[] };
          if (!Array.isArray(body.messages)) {
            return new Response("Messages are required", { status: 400 });
          }
          messages = body.messages;
        } catch {
          return new Response("Invalid request body", { status: 400 });
        }

        try {
          const gateway = createAiGateway();
          const result = streamText({
            model: gateway.responses(AI_MODEL),
            system: AI_SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages),
            stopWhen: stepCountIs(50),
            providerOptions: { openai: { store: false } },
            tools: {
              propose_captures: tool({
                description:
                  "Propose tasks, notes, thoughts, events or reminders extracted from the user's message. The user confirms before anything is saved.",
                inputSchema: proposalSchema,
                execute: async (input) => input,
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
