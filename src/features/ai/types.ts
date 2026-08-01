export type CaptureKind = "task" | "note" | "thought" | "event" | "reminder";

export type CaptureProposal = {
  kind: CaptureKind;
  title: string;
  details: string | null;
  date: string | null;
  time: string | null;
  priority: "low" | "medium" | "high" | null;
  category: "study" | "personal" | "work" | "health" | "other" | null;
  tag: string | null;
};

export type CaptureProposalPayload = { items: CaptureProposal[] };

export type AiMessageRow = {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export const QUICK_ACTIONS: { label: string; prompt: string }[] = [
  {
    label: "Plan My Day",
    prompt: "Help me plan my day. Ask me anything you need, then give me a realistic schedule.",
  },
  {
    label: "Organize My Tasks",
    prompt: "Help me organise and prioritise my current tasks into a clear order of attack.",
  },
  {
    label: "Brain Dump",
    prompt:
      "I want to brain dump. I'll write everything on my mind and you turn it into tasks, reminders, events and notes I can confirm.",
  },
  {
    label: "Study Assistant",
    prompt: "Be my study assistant. Ask what I'm studying and break it into focused sessions.",
  },
  { label: "Productivity Tips", prompt: "Give me three practical productivity tips I can use today." },
  {
    label: "Weekly Review",
    prompt: "Walk me through a short weekly review: wins, misses, and what to focus on next week.",
  },
];
