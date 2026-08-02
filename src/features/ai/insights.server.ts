import { streamText } from "ai";
import { AI_MODEL, createAiGateway } from "@/lib/ai-gateway.server";

/**
 * Server-only prompt runners for the AI Companion's proactive surfaces
 * (daily briefing, weekly insights, capture replies).
 */

export const COMPANION_VOICE = `You are D2D AI, the user's calm, warm, practical life companion inside a premium productivity app.
Voice: personal, positive, useful. Never generic, never preachy, never repetitive. Short sentences.`;

function stripFences(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
}

/** Runs one streaming call and returns the joined text (streaming is required). */
export async function runText(system: string, prompt: string): Promise<string> {
  const gateway = createAiGateway();
  const result = streamText({
    model: gateway.responses(AI_MODEL),
    system,
    prompt,
    providerOptions: { openai: { store: false } },
  });
  return (await result.text).trim();
}

/** Runs a prompt that must answer with JSON; falls back when the model drifts. */
export async function runJson<T>(system: string, prompt: string, fallback: T): Promise<T> {
  try {
    const raw = stripFences(await runText(system, prompt));
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) return fallback;
    return { ...fallback, ...(JSON.parse(raw.slice(start, end + 1)) as object) } as T;
  } catch (error) {
    console.error("[ai] json prompt failed", error);
    return fallback;
  }
}

export const DAILY_SYSTEM = `${COMPANION_VOICE}

You write a morning-style briefing for the home screen.
Answer ONLY with JSON in this exact shape:
{"greeting":"one or two sentences","plan":["step","step","step"],"suggestions":["short chip","short chip","short chip"]}

Rules:
- greeting: personal, context aware, encouraging. Reference real numbers from the context (tasks today, what they finished yesterday, how today compares). Max 240 characters.
- plan: 2-4 concrete recommendations for today, ordered. Each under 90 characters. Mention specific task titles when useful. If there is nothing scheduled, suggest a light, useful way to use the day.
- suggestions: 3 tappable prompt ideas the user might ask you next, each under 34 characters, no punctuation at the end.
- Never invent tasks, events or dates that are not in the context.`;

export const WEEKLY_SYSTEM = `${COMPANION_VOICE}

You write a weekly review for the insights screen.
Answer ONLY with JSON in this exact shape:
{"summary":"2-3 sentences","trend":"one sentence","mostProductiveDay":"weekday or empty string","priorities":["item","item","item"],"encouragement":"one warm sentence"}

Rules:
- Use only the numbers and titles provided. Compare this week with last week for the trend.
- priorities: up to 3 things worth focusing on next week, each under 80 characters.
- If there is barely any data, be honest and kind instead of inventing progress.`;

export const REPLY_SYSTEM = `${COMPANION_VOICE}

The user just saved something in the app. Reply with ONE sentence (max 22 words) that acknowledges it and offers a genuinely useful next step or insight.
No markdown, no quotes, no emoji, no greeting. Never say the word "saved" twice. Vary your phrasing every time.`;

export function replyPrompt(input: {
  kind: string;
  title: string;
  details?: string | null;
  when?: string | null;
}) {
  return [
    `Kind: ${input.kind}`,
    `Title: ${input.title}`,
    input.details ? `Details: ${input.details}` : null,
    input.when ? `Scheduled: ${input.when}` : null,
    "",
    "Reply now.",
  ]
    .filter(Boolean)
    .join("\n");
}
