import type { AvatarEmotion } from "./avatar-store";

export type ReactionKind =
  | "task"
  | "note"
  | "thought"
  | "event"
  | "reminder"
  | "completed";

type Line = { text: string; emotion: AvatarEmotion };

/** Remembers the last line used per bucket so the companion never repeats itself. */
const lastUsed = new Map<string, string>();

function pick(bucket: string, lines: Line[]): Line {
  const previous = lastUsed.get(bucket);
  const pool = lines.length > 1 ? lines.filter((l) => l.text !== previous) : lines;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  lastUsed.set(bucket, chosen.text);
  return chosen;
}

const BASE: Record<ReactionKind, Line[]> = {
  task: [
    { text: "Great — you're one step closer to today's goal.", emotion: "happy" },
    { text: "Added. I'll keep an eye on this one for you.", emotion: "happy" },
    { text: "Noted. Small steps, real progress.", emotion: "happy" },
    { text: "That's on your plan now. Want to schedule it?", emotion: "thinking" },
  ],
  note: [
    { text: "Saved. Good notes make good decisions.", emotion: "happy" },
    { text: "Filed away — you'll find it when you need it.", emotion: "happy" },
    { text: "Captured. Want me to summarise it later?", emotion: "thinking" },
  ],
  thought: [
    { text: "Interesting thought. Would you like to expand it?", emotion: "thinking" },
    { text: "I like where this is going. Keep it flowing.", emotion: "happy" },
    { text: "Saved your thinking. We can shape it into a plan anytime.", emotion: "thinking" },
  ],
  event: [
    { text: "It's on your calendar. I'll keep the time free.", emotion: "happy" },
    { text: "Scheduled. I'll remind you before it starts.", emotion: "listening" },
    { text: "Locked in. Want a prep task beforehand?", emotion: "thinking" },
  ],
  reminder: [
    { text: "I'll make sure you don't forget.", emotion: "listening" },
    { text: "Consider it remembered.", emotion: "happy" },
    { text: "I'll nudge you at the right moment.", emotion: "listening" },
  ],
  completed: [
    { text: "Congratulations — that's a real achievement.", emotion: "celebrating" },
    { text: "Done and dusted. That's momentum.", emotion: "celebrating" },
    { text: "Excellent. Your day is moving forward.", emotion: "celebrating" },
  ],
};

const TOPICS: { match: RegExp; lines: Line[] }[] = [
  {
    match: /\b(stud(y|ying)|exam|revise|revision|homework|assignment|lecture)\b/i,
    lines: [
      { text: "This looks like about a one-hour focused session.", emotion: "thinking" },
      { text: "Study block noted. Short breaks will help you retain more.", emotion: "thinking" },
    ],
  },
  {
    match: /\b(business|startup|idea|product|client|launch|website|brand)\b/i,
    lines: [
      { text: "Nice idea. Shall we turn this into a project?", emotion: "thinking" },
      { text: "Promising. Want me to break it into first steps?", emotion: "thinking" },
    ],
  },
  {
    match: /\b(gym|run|workout|training|health|sleep|water|walk)\b/i,
    lines: [
      { text: "Good for you — consistency beats intensity.", emotion: "happy" },
      { text: "Your future self will thank you for this one.", emotion: "happy" },
    ],
  },
  {
    match: /\b(meeting|call|interview|presentation|standup)\b/i,
    lines: [
      { text: "I'd leave ten quiet minutes before this to prepare.", emotion: "thinking" },
      { text: "Noted. Want a short agenda for it?", emotion: "thinking" },
    ],
  },
];

/** A short, varied, context-aware line for something the user just captured. */
export function reactionFor(kind: ReactionKind, title = ""): Line {
  const topic = TOPICS.find((t) => t.match.test(title));
  if (topic && Math.random() < 0.65) return pick(`topic:${kind}`, topic.lines);
  return pick(kind, BASE[kind]);
}

export function timeOfDay(date = new Date()): "morning" | "afternoon" | "evening" | "night" {
  const h = date.getHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  if (h < 23) return "evening";
  return "night";
}

/** The daily greeting shown once when the app is opened. */
export function greetingFor(stats: {
  today: number;
  overdue: number;
  completedYesterday: number;
  streak: number;
}): Line {
  const slot = timeOfDay();
  if (slot === "night") {
    return {
      text: "It's late — I'll keep things quiet. Capture anything on your mind and rest.",
      emotion: "sleeping",
    };
  }

  const hello = `Good ${slot}!`;
  const options: Line[] = [];

  if (stats.overdue > 0)
    options.push({
      text: `${hello} ${stats.overdue} ${stats.overdue === 1 ? "task is" : "tasks are"} overdue — shall we clear those first?`,
      emotion: "greeting",
    });
  if (stats.today > 0)
    options.push({
      text: `${hello} You have ${stats.today} important ${stats.today === 1 ? "task" : "tasks"} today.`,
      emotion: "greeting",
    });
  if (stats.completedYesterday > 0)
    options.push({
      text: `${hello} You completed ${stats.completedYesterday} ${stats.completedYesterday === 1 ? "task" : "tasks"} yesterday. Excellent consistency.`,
      emotion: "greeting",
    });
  if (stats.streak >= 3)
    options.push({
      text: `${hello} You've kept a ${stats.streak}-day streak going.`,
      emotion: "celebrating",
    });
  if (!options.length)
    options.push(
      { text: `${hello} A clean slate — what matters most today?`, emotion: "greeting" },
      { text: `${hello} I'm here whenever you want to plan or think out loud.`, emotion: "greeting" },
    );

  return pick("greeting", options);
}

/** Occasional, gentle encouragement — never more than once per session. */
export function encouragementFor(stats: {
  today: number;
  overdue: number;
  completedThisWeek: number;
  streak: number;
}): Line | null {
  const options: Line[] = [];
  if (stats.streak >= 7)
    options.push({ text: `You've maintained a ${stats.streak}-day streak. That's real discipline.`, emotion: "celebrating" });
  if (stats.completedThisWeek >= 5)
    options.push({ text: `${stats.completedThisWeek} tasks done this week — you're getting closer to your monthly goal.`, emotion: "happy" });
  if (stats.overdue >= 3)
    options.push({ text: "A few things have slipped. Want to pick just one and finish it?", emotion: "thinking" });
  if (stats.today === 0 && stats.completedThisWeek > 0)
    options.push({ text: "Nothing planned today. A small step still keeps the rhythm.", emotion: "thinking" });
  if (!options.length) return null;
  return pick("encouragement", options);
}
