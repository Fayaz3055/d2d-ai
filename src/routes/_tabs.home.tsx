import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useTasks, tasksStore } from "@/features/tasks/use-tasks";
import { useNotes } from "@/features/notes/use-notes";
import { useThoughts } from "@/features/thoughts/use-thoughts";
import { useEvents, eventTimestamp } from "@/features/events/use-events";
import { useReminders } from "@/features/reminders/use-reminders";
import { useUnreadCount } from "@/features/notifications/use-notifications";

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
function isSameDay(dateStr: string) {
  if (!dateStr) return false;
  return new Date(dateStr + "T00:00:00").setHours(0, 0, 0, 0) === startOfToday();
}

function Home() {
  const navigate = useNavigate();
  const tasks = useTasks();
  const notes = useNotes();
  const thoughts = useThoughts();
  const events = useEvents();
  const reminders = useReminders();
  const unread = useUnreadCount();

  const { overdue, todayTasks } = useMemo(() => {
    const t0 = startOfToday();
    const open = tasks.filter((t) => !t.completed && t.dueDate);
    return {
      overdue: open
        .filter((t) => new Date(t.dueDate + "T00:00:00").setHours(0, 0, 0, 0) < t0)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      todayTasks: open
        .filter((t) => isSameDay(t.dueDate))
        .sort((a, b) => a.createdAt - b.createdAt),
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
      .filter(({ ts }) => ts >= now)
      .sort((a, b) => a.ts - b.ts)
      .slice(0, 3)
      .map(({ e }) => e);
  }, [events]);

  const todayReminders = useMemo(
    () => reminders.filter((r) => isSameDay(r.date)).sort((a, b) => (a.time || "").localeCompare(b.time || "")),
    [reminders],
  );

  return (
    <div className="animate-fade-up pb-4">
      <header className="flex items-start justify-between gap-4 px-5 pt-8 pb-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{greet()}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's your day at a glance.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/notifications"
            aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-[var(--shadow-soft)] transition-colors hover:text-foreground"
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-[var(--shadow-soft)] transition-colors hover:text-foreground"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="space-y-6 px-5">
        {/* Today's Tasks */}
        <Section
          title="Today's Tasks"
          onViewAll={() => navigate({ to: "/tasks" })}
          showViewAll={tasks.length > 0}
        >
          {overdue.length === 0 && todayTasks.length === 0 ? (
            <EmptyRow icon={CheckCircle2} text="No tasks for today." />
          ) : (
            <ul className="space-y-2">
              {overdue.map((t) => (
                <TaskRow key={t.id} task={t} overdue />
              ))}
              {todayTasks.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          )}
        </Section>

        {/* Upcoming Events */}
        <Section
          title="Upcoming Events"
          onViewAll={() => navigate({ to: "/events" })}
          showViewAll={events.length > 0}
        >
          {upcomingEvents.length === 0 ? (
            <EmptyRow icon={CalendarDays} text="No upcoming events." />
          ) : (
            <ul className="space-y-2">
              {upcomingEvents.map((e) => (
                <li key={e.id}>
                  <Link
                    to="/events/$id"
                    params={{ id: e.id }}
                    className="nova-card flex items-center gap-3 p-3.5"
                  >
                    <span className="flex h-11 w-11 flex-none flex-col items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">
                        {e.date
                          ? new Date(e.date + "T00:00:00").toLocaleDateString(undefined, { month: "short" })
                          : "TBD"}
                      </span>
                      <span className="text-base font-semibold leading-none">
                        {e.date ? new Date(e.date + "T00:00:00").getDate() : "—"}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold tracking-tight">
                        {e.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {e.time || "All day"}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Thoughts */}
        <Section
          title="Thoughts"
          onViewAll={() => navigate({ to: "/thoughts" })}
          showViewAll={thoughts.length > 0}
        >
          {latestThoughts.length === 0 ? (
            <EmptyRow icon={Sparkles} text="No thoughts captured yet." />
          ) : (
            <ul className="space-y-2">
              {latestThoughts.map((t) => (
                <li key={t.id}>
                  <Link
                    to="/thoughts/$id"
                    params={{ id: t.id }}
                    className="nova-card block p-4"
                  >
                    <p className="line-clamp-2 text-sm leading-relaxed text-foreground">
                      {t.thought}
                    </p>
                    {t.tag ? (
                      <span className="mt-2 inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {t.tag}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Notes */}
        <Section
          title="Notes"
          onViewAll={() => navigate({ to: "/notes" })}
          showViewAll={notes.length > 0}
        >
          {latestNotes.length === 0 ? (
            <EmptyRow icon={StickyNote} text="No notes yet." />
          ) : (
            <ul className="space-y-2">
              {latestNotes.map((n) => (
                <li key={n.id}>
                  <Link to="/notes/$id" params={{ id: n.id }} className="nova-card block p-4">
                    <p className="truncate text-[15px] font-semibold tracking-tight">
                      {n.title || "Untitled"}
                    </p>
                    {n.body ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {n.body}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Reminders */}
        <Section
          title="Reminders"
          onViewAll={() => navigate({ to: "/reminders" })}
          showViewAll={reminders.length > 0}
        >
          {todayReminders.length === 0 ? (
            <EmptyRow icon={BellRing} text="No reminders for today." />
          ) : (
            <ul className="space-y-2">
              {todayReminders.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/reminders/$id"
                    params={{ id: r.id }}
                    className="nova-card flex items-center gap-3 p-3.5"
                  >
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <BellRing className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold tracking-tight">
                        {r.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {r.time || "Any time"}
                      </span>
                    </span>
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

function Section({
  title,
  onViewAll,
  showViewAll,
  children,
}: {
  title: string;
  onViewAll?: () => void;
  showViewAll?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h2>
        {showViewAll && onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-opacity hover:opacity-80"
          >
            View all <ArrowRight className="h-3 w-3" />
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function EmptyRow({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="nova-card flex items-center gap-3 px-4 py-4">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function TaskRow({ task, overdue }: { task: import("@/features/tasks/types").Task; overdue?: boolean }) {
  return (
    <li>
      <div className="nova-card flex items-center gap-3 p-3.5">
        <button
          type="button"
          aria-label="Complete task"
          onClick={() => tasksStore.toggle(task.id)}
          className="flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 border-border bg-background transition-colors hover:border-primary/60"
        />
        <Link
          to="/tasks/$id"
          params={{ id: task.id }}
          className="min-w-0 flex-1"
        >
          <p
            className={cn(
              "truncate text-[15px] font-semibold tracking-tight",
              task.completed && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </p>
          {overdue ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[oklch(0.88_0.08_25)] bg-[oklch(0.96_0.05_25)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.55_0.18_25)]">
              <AlertCircle className="h-3 w-3" />
              Overdue
            </span>
          ) : null}
        </Link>
      </div>
    </li>
  );
}
