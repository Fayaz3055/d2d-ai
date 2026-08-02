import { useMemo } from "react";
import { useTasks } from "@/features/tasks/use-tasks";
import { useNotes } from "@/features/notes/use-notes";
import { useThoughts } from "@/features/thoughts/use-thoughts";
import { useEvents } from "@/features/events/use-events";
import { useReminders } from "@/features/reminders/use-reminders";

/**
 * A compact, privacy-conscious snapshot of the user's day, sent to the AI so
 * every reply is context aware. Kept small on purpose (mobile + token budget).
 *
 * Extension point: new intelligence modules (habits, mood, finance, learning)
 * add fields here and the whole AI surface becomes aware of them at once.
 */
export type LifeContext = {
  today: string;
  weekday: string;
  clock: string;
  counts: {
    openTasks: number;
    dueToday: number;
    overdue: number;
    completedToday: number;
    completedYesterday: number;
    completedThisWeek: number;
    completedLastWeek: number;
    notes: number;
    thoughts: number;
  };
  todayTasks: { title: string; priority: string; category: string }[];
  overdueTasks: { title: string; due: string }[];
  todayEvents: { title: string; time: string }[];
  upcomingEvents: { title: string; date: string; time: string }[];
  todayReminders: { title: string; time: string }[];
  recentThoughts: string[];
  recentNotes: string[];
  completionsByWeekday: Record<string, number>;
};

const DAY = 86_400_000;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function startOfDay(ts: number) {
  return new Date(ts).setHours(0, 0, 0, 0);
}
function isoDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function dayStart(dateStr: string) {
  if (!dateStr) return Number.NaN;
  return new Date(dateStr + "T00:00:00").setHours(0, 0, 0, 0);
}

/** Reactive life context built from every cloud store. */
export function useLifeContext(): LifeContext {
  const tasks = useTasks();
  const notes = useNotes();
  const thoughts = useThoughts();
  const events = useEvents();
  const reminders = useReminders();

  return useMemo(() => {
    const now = Date.now();
    const t0 = startOfDay(now);
    const today = isoDate(now);
    const yesterday = t0 - DAY;
    const weekAgo = t0 - 6 * DAY;
    const twoWeeksAgo = t0 - 13 * DAY;

    const open = tasks.filter((t) => !t.completed);
    const done = tasks.filter((t) => t.completed && t.completedAt);

    const completionsByWeekday: Record<string, number> = {};
    done
      .filter((t) => (t.completedAt ?? 0) >= weekAgo)
      .forEach((t) => {
        const label = WEEKDAYS[new Date(t.completedAt ?? 0).getDay()];
        completionsByWeekday[label] = (completionsByWeekday[label] ?? 0) + 1;
      });

    return {
      today,
      weekday: WEEKDAYS[new Date(now).getDay()],
      clock: new Date(now).toTimeString().slice(0, 5),
      counts: {
        openTasks: open.length,
        dueToday: open.filter((t) => dayStart(t.dueDate) === t0).length,
        overdue: open.filter((t) => t.dueDate && dayStart(t.dueDate) < t0).length,
        completedToday: done.filter((t) => (t.completedAt ?? 0) >= t0).length,
        completedYesterday: done.filter(
          (t) => (t.completedAt ?? 0) >= yesterday && (t.completedAt ?? 0) < t0,
        ).length,
        completedThisWeek: done.filter((t) => (t.completedAt ?? 0) >= weekAgo).length,
        completedLastWeek: done.filter(
          (t) => (t.completedAt ?? 0) >= twoWeeksAgo && (t.completedAt ?? 0) < weekAgo,
        ).length,
        notes: notes.length,
        thoughts: thoughts.length,
      },
      todayTasks: open
        .filter((t) => dayStart(t.dueDate) === t0)
        .slice(0, 8)
        .map((t) => ({ title: t.title, priority: t.priority, category: t.category })),
      overdueTasks: open
        .filter((t) => t.dueDate && dayStart(t.dueDate) < t0)
        .slice(0, 5)
        .map((t) => ({ title: t.title, due: t.dueDate })),
      todayEvents: events
        .filter((e) => e.date === today)
        .slice(0, 6)
        .map((e) => ({ title: e.title, time: e.time })),
      upcomingEvents: events
        .filter((e) => e.date && dayStart(e.date) > t0)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 4)
        .map((e) => ({ title: e.title, date: e.date, time: e.time })),
      todayReminders: reminders
        .filter((r) => r.date === today && !r.done)
        .slice(0, 6)
        .map((r) => ({ title: r.title, time: r.time })),
      recentThoughts: [...thoughts]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 4)
        .map((t) => t.thought.slice(0, 160)),
      recentNotes: [...notes]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 4)
        .map((n) => (n.title || n.body).slice(0, 120)),
      completionsByWeekday,
    };
  }, [tasks, notes, thoughts, events, reminders]);
}
