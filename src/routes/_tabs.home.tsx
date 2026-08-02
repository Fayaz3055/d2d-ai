import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  User,
  ArrowRight,
  CheckCircle2,
  StickyNote,
  Sparkles,
  CalendarDays,
  BellRing,
  AlertCircle,
  Check,
  LineChart,
  Brain,
} from "lucide-react";
import { memo, useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTasks, tasksStore, useTasksLoaded } from "@/features/tasks/use-tasks";
import { useNotes } from "@/features/notes/use-notes";
import { useThoughts } from "@/features/thoughts/use-thoughts";
import { useEvents, eventTimestamp } from "@/features/events/use-events";
import { useReminders } from "@/features/reminders/use-reminders";
import { useUnreadCount } from "@/features/notifications/use-notifications";
import { useSession, useProfile, displayNameOf } from "@/features/auth/use-auth";
import { useLifeContext } from "@/features/ai/context";
import { useDailyBriefing } from "@/features/ai/use-daily-briefing";
import { AiBriefingCard } from "@/features/ai/components/ai-briefing-card";
import { QuickAddRow } from "@/features/ai/components/quick-add-row";
import type { Task } from "@/features/tasks/types";

export const Route = createFileRoute("/_tabs/home")({
  head: () => ({
    meta: [
      { title: "Home — D2D AI" },
      { name: "description", content: "Your calm daily overview in D2D AI." },
      { property: "og:title", content: "Home — D2D AI" },
      { property: "og:description", content: "Your calm daily overview." },
    ],
  }),
  component: Home,
});

const greet = () => {
  const h = new Date().getHours();
  if (h < 5) return "Still up?";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

function startOfToday() {
  return new Date().setHours(0, 0, 0, 0);
}
function dayStart(dateStr: string) {
  if (!dateStr) return Number.NaN;
  return new Date(dateStr + "T00:00:00").setHours(0, 0, 0, 0);
}
function isToday(dateStr: string) {
  return dayStart(dateStr) === startOfToday();
}

function Home() {
  const tasks = useTasks();
  const notes = useNotes();
  const thoughts = useThoughts();
  const events = useEvents();
  const reminders = useReminders();
  const unread = useUnreadCount();
  const tasksLoaded = useTasksLoaded();
  const { user } = useSession();
  const profile = useProfile(user);
  const lifeContext = useLifeContext();
  const { briefing, loading: briefingLoading, refresh } = useDailyBriefing(
    lifeContext,
    tasksLoaded && !!user,
  );
  const firstName = displayNameOf(user, profile).split(" ")[0];

  const { overdue, todayTasks, doneToday, totalToday } = useMemo(() => {
    const t0 = startOfToday();
    const dueToday = tasks.filter((t) => isToday(t.dueDate));
    const open = tasks.filter((t) => !t.completed && t.dueDate);
    return {
      overdue: open
        .filter((t) => dayStart(t.dueDate) < t0)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      todayTasks: open
        .filter((t) => isToday(t.dueDate))
        .sort((a, b) => a.createdAt - b.createdAt),
      doneToday: dueToday.filter((t) => t.completed).length,
      totalToday: dueToday.length,
    };
  }, [tasks]);

  const latestNotes = useMemo(
    () => [...notes].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3),
    [notes],
  );
  const latestThoughts = useMemo(
    () => [...thoughts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3),
    [thoughts],
  );

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return [...events]
      .map((e) => ({ e, ts: eventTimestamp(e) }))
      .filter(({ ts }) => Number.isFinite(ts) && ts >= now)
      .sort((a, b) => a.ts - b.ts)
      .slice(0, 3)
      .map(({ e }) => e);
  }, [events]);

  const todayReminders = useMemo(
    () =>
      reminders
        .filter((r) => isToday(r.date))
        .sort((a, b) => (a.time || "").localeCompare(b.time || "")),
    [reminders],
  );

  const pct = totalToday === 0 ? 0 : Math.round((doneToday / totalToday) * 100);
  const dashTasks = [...overdue, ...todayTasks];

  return (
    <div className="animate-fade-up pb-2">
      <header className="flex items-center justify-between gap-3 px-5 pt-7 pb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
            D2D AI
          </p>
          <h1 className="mt-0.5 truncate text-xl font-semibold tracking-tight">{greet()}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/notifications"
            aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-[var(--shadow-soft)] transition-all active:scale-95 hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <Link
            to="/profile"
            aria-label="Profile"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-[var(--shadow-soft)] transition-all active:scale-95 hover:text-foreground"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="space-y-4 px-5">
        {/* Compact progress + counts */}
        <div className="nova-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                Today's Progress
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <span className="text-base font-semibold tracking-tight text-foreground">
                  {doneToday}
                </span>{" "}
                / {totalToday} tasks done
              </p>
            </div>
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              {pct}%
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[oklch(0.82_0.13_85)] to-[oklch(0.68_0.14_75)] shadow-[0_0_10px_oklch(0.72_0.14_85/0.45)] transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-3.5 grid grid-cols-4 gap-2 border-t border-border/60 pt-3">
            <Stat to="/tasks" label="Tasks" value={tasks.filter((t) => !t.completed).length} />
            <Stat to="/notes" label="Notes" value={notes.length} />
            <Stat to="/thoughts" label="Ideas" value={thoughts.length} />
            <Stat to="/events" label="Events" value={events.length} />
          </div>
        </div>

        {/* Today's Tasks */}
        <Section title="Today's Tasks" to="/tasks" count={dashTasks.length}>
          {dashTasks.length === 0 ? (
            <EmptyRow icon={CheckCircle2} text="No tasks for today." />
          ) : (
            <ul className="nova-card divide-y divide-border/60 overflow-hidden p-0">
              {dashTasks.slice(0, 4).map((t) => (
                <TaskRow key={t.id} task={t} overdue={dayStart(t.dueDate) < startOfToday()} />
              ))}
            </ul>
          )}
        </Section>

        {/* Upcoming Events */}
        <Section title="Upcoming Events" to="/events" count={upcomingEvents.length}>
          {upcomingEvents.length === 0 ? (
            <EmptyRow icon={CalendarDays} text="No upcoming events." />
          ) : (
            <ul className="nova-card divide-y divide-border/60 overflow-hidden p-0">
              {upcomingEvents.map((e) => (
                <li key={e.id}>
                  <Link
                    to="/events/$id"
                    params={{ id: e.id }}
                    className="flex items-center gap-3 px-3.5 py-2.5 transition-colors active:bg-accent/50"
                  >
                    <span className="flex h-9 w-9 flex-none flex-col items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <span className="text-[8px] font-semibold uppercase tracking-wider opacity-80">
                        {e.date
                          ? new Date(e.date + "T00:00:00").toLocaleDateString(undefined, {
                              month: "short",
                            })
                          : "TBD"}
                      </span>
                      <span className="text-sm font-semibold leading-none">
                        {e.date ? new Date(e.date + "T00:00:00").getDate() : "—"}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold tracking-tight">
                        {e.title}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {e.time || "All day"}
                      </span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 flex-none text-muted-foreground/50" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Reminders */}
        <Section title="Today's Reminders" to="/reminders" count={todayReminders.length}>
          {todayReminders.length === 0 ? (
            <EmptyRow icon={BellRing} text="No reminders for today." />
          ) : (
            <ul className="nova-card divide-y divide-border/60 overflow-hidden p-0">
              {todayReminders.slice(0, 3).map((r) => (
                <li key={r.id}>
                  <Link
                    to="/reminders/$id"
                    params={{ id: r.id }}
                    className="flex items-center gap-3 px-3.5 py-2.5 transition-colors active:bg-accent/50"
                  >
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <BellRing className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight">
                      {r.title}
                    </span>
                    <span className="flex-none text-[11px] font-medium text-muted-foreground">
                      {r.time || "Any time"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Thoughts */}
        <Section title="Thoughts" to="/thoughts" count={thoughts.length}>
          {latestThoughts.length === 0 ? (
            <EmptyRow icon={Sparkles} text="No thoughts captured yet." />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {latestThoughts.map((t) => (
                <Link
                  key={t.id}
                  to="/thoughts/$id"
                  params={{ id: t.id }}
                  className="nova-card block p-3 transition-transform active:scale-[0.985]"
                >
                  <p className="line-clamp-3 text-[13px] leading-relaxed text-foreground">
                    {t.thought}
                  </p>
                  {t.tag ? (
                    <span className="mt-2 inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                      {t.tag}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </Section>

        {/* Notes */}
        <Section title="Notes" to="/notes" count={notes.length}>
          {latestNotes.length === 0 ? (
            <EmptyRow icon={StickyNote} text="No notes yet." />
          ) : (
            <ul className="nova-card divide-y divide-border/60 overflow-hidden p-0">
              {latestNotes.map((n) => (
                <li key={n.id}>
                  <Link
                    to="/notes/$id"
                    params={{ id: n.id }}
                    className="flex items-center gap-3 px-3.5 py-2.5 transition-colors active:bg-accent/50"
                  >
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <StickyNote className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold tracking-tight">
                        {n.title || "Untitled"}
                      </span>
                      {n.body ? (
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {n.body}
                        </span>
                      ) : null}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 flex-none text-muted-foreground/50" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function Stat({
  to,
  label,
  value,
}: {
  to: "/tasks" | "/notes" | "/thoughts" | "/events";
  label: string;
  value: number;
}) {
  return (
    <Link to={to} className="flex flex-col items-center rounded-xl py-1 active:bg-accent/50">
      <span className="text-base font-semibold tracking-tight text-foreground">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
    </Link>
  );
}

function Section({
  title,
  to,
  count,
  children,
}: {
  title: string;
  to: "/tasks" | "/notes" | "/thoughts" | "/events" | "/reminders";
  count?: number;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
          {count ? (
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">
              {count}
            </span>
          ) : null}
        </h2>
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-opacity active:opacity-70 hover:opacity-80"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function EmptyRow({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="nova-card flex items-center gap-3 px-3.5 py-3">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

const TaskRow = memo(function TaskRow({ task, overdue }: { task: Task; overdue?: boolean }) {
  return (
    <li className="flex items-center gap-3 px-3.5 py-2.5">
      <button
        type="button"
        aria-label="Complete task"
        onClick={() => tasksStore.toggle(task.id)}
        className="group flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 border-border bg-background transition-all active:scale-90 hover:border-primary/60"
      >
        <Check className="h-3.5 w-3.5 text-primary opacity-0 transition-opacity group-hover:opacity-60" />
      </button>
      <Link to="/tasks/$id" params={{ id: task.id }} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-tight">{task.title}</p>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {overdue ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border border-[oklch(0.88_0.08_25)] bg-[oklch(0.96_0.05_25)] px-1.5 py-0.5",
                "text-[9px] font-semibold uppercase tracking-wider text-[oklch(0.55_0.18_25)]",
              )}
            >
              <AlertCircle className="h-2.5 w-2.5" />
              Overdue
            </span>
          ) : (
            <span className="capitalize">{task.category}</span>
          )}
        </span>
      </Link>
      <ArrowRight className="h-3.5 w-3.5 flex-none text-muted-foreground/50" />
    </li>
  );
});
