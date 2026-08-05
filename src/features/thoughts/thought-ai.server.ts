import { z } from "zod";
import { COMPANION_VOICE, runJson } from "@/features/ai/insights.server";
import { THOUGHT_CATEGORIES } from "./categories";

/**
 * Server-only prompts and schemas for Thought Evolution. Kept out of the
 * `.functions.ts` wrapper so server-function splitting stays safe.
 */

export const AnalyzeInput = z.object({
  text: z.string().min(1).max(2000),
  tag: z.string().max(80).nullable().optional(),
  related: z.array(z.string().max(300)).max(6).optional(),
});

export const ACTION_KINDS = [
  "task",
  "reminder",
  "event",
  "goal",
  "project",
  "expand",
  "summarize",
] as const;
export type ThoughtActionKind = (typeof ACTION_KINDS)[number];

export const ActionInput = z.object({
  text: z.string().min(1).max(4000),
  category: z.string().max(40),
  mode: z.enum(["expand", "summarize", "plan"]),
});

export const PatternInput = z.object({
  category: z.string().max(40),
  thoughts: z.array(z.string().max(400)).min(1).max(12),
});

export type ThoughtAnalysis = {
  category: string;
  reply: string;
  actions: string[];
};

export type ThoughtElaboration = {
  text: string;
  tasks: string[];
};

export type ProjectPlan = {
  projectTitle: string;
  projectDescription: string;
  goal: string;
  noteTitle: string;
  noteBody: string;
  tasks: string[];
};

const CATEGORY_GUIDE = `Categories: ${THOUGHT_CATEGORIES.join(", ")}.
- idea: a creative spark with no clear owner yet
- goal: something the user wants to achieve over weeks or months
- business: startups, products, money-making ventures, side hustles
- study: exam prep, coursework, revision plans
- journal: feelings, mood, reflection about the day
- random: passing observation, no intent
- personal: relationships, family, self-care, health
- learning: wanting to learn a skill, language, technology`;

export const ANALYZE_SYSTEM = `${COMPANION_VOICE}

The user just captured a thought. Understand its purpose, classify it, and reply once.
${CATEGORY_GUIDE}

Answer ONLY with JSON:
{"category":"one of the categories","reply":"one or two short sentences","actions":["task","reminder","event","goal","project","expand","summarize"]}

Rules for reply:
- Max 30 words, human, warm, specific to what they wrote. No markdown, no emoji, no quotes.
- Mirror their intent, then offer ONE genuinely useful next step as a question ("Would you like me to ...?").
- If they sound stressed or low, respond with care before suggesting work.
- Vary phrasing every single time. Never reuse a template.
- If related earlier thoughts are provided and clearly share a theme, mention that gently.
Rules for actions: 1-3 items, the most useful ones for THIS thought, ordered by usefulness.`;

export const ELABORATE_SYSTEM = `${COMPANION_VOICE}

You help an idea grow. Answer ONLY with JSON:
{"text":"markdown body","tasks":["short actionable task","..."]}

- mode "expand": 3-6 bullet points that develop the idea (angles, first steps, risks).
- mode "summarize": 2-3 sentences capturing the essence, no bullets.
- mode "plan": a short roadmap with 3-5 ordered steps.
- tasks: 0-5 concrete next actions under 70 characters each. Empty array for summarize.
- Never invent facts about the user. Keep the whole answer under 160 words.`;

export const PATTERN_SYSTEM = `${COMPANION_VOICE}

The user has captured several thoughts that share a theme. Turn them into one dedicated project.
Answer ONLY with JSON:
{"projectTitle":"short title","projectDescription":"one or two sentences","goal":"one sentence outcome","noteTitle":"short title","noteBody":"markdown notes gathering the ideas","tasks":["first step","..."]}

- tasks: 3-5 ordered first steps, each under 70 characters.
- Use only what the thoughts actually say. Keep everything tight and practical.`;

export function analyzePrompt(input: z.infer<typeof AnalyzeInput>) {
  return [
    `Thought: ${input.text}`,
    input.tag ? `User tag: ${input.tag}` : null,
    input.related?.length
      ? `Earlier related thoughts:\n${input.related.map((t) => `- ${t}`).join("\n")}`
      : null,
    "",
    "Answer now.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function runAnalyze(input: z.infer<typeof AnalyzeInput>) {
  return runJson<ThoughtAnalysis>(ANALYZE_SYSTEM, analyzePrompt(input), {
    category: "random",
    reply: "",
    actions: [],
  });
}

export function runElaborate(input: z.infer<typeof ActionInput>) {
  return runJson<ThoughtElaboration>(
    ELABORATE_SYSTEM,
    `mode: ${input.mode}\ncategory: ${input.category}\nThought: ${input.text}\n\nAnswer now.`,
    { text: "", tasks: [] },
  );
}

export function runPattern(input: z.infer<typeof PatternInput>) {
  return runJson<ProjectPlan>(
    PATTERN_SYSTEM,
    `Shared theme: ${input.category}\nThoughts:\n${input.thoughts.map((t) => `- ${t}`).join("\n")}\n\nAnswer now.`,
    {
      projectTitle: "",
      projectDescription: "",
      goal: "",
      noteTitle: "",
      noteBody: "",
      tasks: [],
    },
  );
}
