/** Thought taxonomy for the AI second brain. */
export const THOUGHT_CATEGORIES = [
  "idea",
  "goal",
  "business",
  "study",
  "journal",
  "random",
  "personal",
  "learning",
] as const;

export type ThoughtCategory = (typeof THOUGHT_CATEGORIES)[number];

export const CATEGORY_META: Record<ThoughtCategory, { label: string; emoji: string }> = {
  idea: { label: "Idea", emoji: "💡" },
  goal: { label: "Goal", emoji: "🎯" },
  business: { label: "Business Idea", emoji: "🚀" },
  study: { label: "Study Idea", emoji: "📚" },
  journal: { label: "Journal", emoji: "📝" },
  random: { label: "Random Thought", emoji: "💭" },
  personal: { label: "Personal", emoji: "❤️" },
  learning: { label: "Learning", emoji: "📖" },
};

export function categoryMeta(category: string) {
  return CATEGORY_META[category as ThoughtCategory] ?? CATEGORY_META.random;
}

export const THOUGHT_STATUSES = ["idea", "expanded", "goal", "project", "done"] as const;
export type ThoughtStatus = (typeof THOUGHT_STATUSES)[number];

export const STATUS_LABEL: Record<ThoughtStatus, string> = {
  idea: "Idea",
  expanded: "Expanded",
  goal: "Goal",
  project: "Project",
  done: "Completed",
};

const STOP = new Set([
  "this",
  "that",
  "with",
  "want",
  "would",
  "should",
  "have",
  "about",
  "there",
  "their",
  "from",
  "into",
  "just",
  "really",
  "today",
  "going",
  "think",
  "maybe",
  "need",
  "some",
  "more",
  "very",
  "then",
  "when",
  "what",
  "will",
]);

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w)),
  );
}

/** Rough overlap score (0-1) used to surface related thoughts locally. */
export function similarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let shared = 0;
  ta.forEach((w) => {
    if (tb.has(w)) shared += 1;
  });
  return shared / Math.min(ta.size, tb.size);
}
