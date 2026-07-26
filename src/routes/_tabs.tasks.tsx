import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ListChecks,
  Search,
  ArrowUpDown,
  ListFilter,
  Plus,
  Sparkles as SparklesIcon,
} from "lucide-react";
import { ScreenHeader } from "@/components/nova/screen-header";
import { cn } from "@/lib/utils";
import { useTasks } from "@/features/tasks/use-tasks";
import { TaskCard } from "@/features/tasks/task-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { quickCapture } from "@/features/quick-capture/quick-capture-store";

export const Route = createFileRoute("/_tabs/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — D2D AI" },
      { name: "description", content: "Plan and complete your day in D2D AI." },
      { property: "og:title", content: "Tasks — D2D AI" },
      { property: "og:description", content: "Plan and complete your day." },
    ],
  }),
  component: Tasks,
});

type Filter = "all" | "today" | "upcoming" | "completed";
type Sort = "due" | "priority" | "recent";

const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 } as const;

function isToday(due: string) {
  if (!due) return false;
  const d = new Date(due + "T00:00:00").setHours(0, 0, 0, 0);
  return d === new Date().setHours(0, 0, 0, 0);
}
function isFuture(due: string) {
  if (!due) return false;
  return new Date(due + "T00:00:00").setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0);
}

function Tasks() {
  const tasks = useTasks();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recent");

  const todayTotal = tasks.filter((t) => isToday(t.dueDate)).length;
  const todayDone = tasks.filter((t) => isToday(t.dueDate) && t.completed).length;
  const pct = todayTotal === 0 ? 0 : Math.round((todayDone / todayTotal) * 100);

  const matchesQuery = (t: (typeof tasks)[number]) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  };

  const sortList = <T extends (typeof tasks)[number]>(list: T[]) => {
    const sorted = [...list];
    if (sort === "due") {
      sorted.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    } else if (sort === "priority") {
      sorted.sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]);
    } else {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    }
    return sorted;
  };

  const { visible, completed } = useMemo(() => {
    let pending = tasks.filter((t) => !t.completed);
    if (filter === "today") pending = pending.filter((t) => isToday(t.dueDate));
    else if (filter === "upcoming") pending = pending.filter((t) => isFuture(t.dueDate));
    else if (filter === "completed") pending = [];

    const done =
      filter === "completed"
        ? tasks.filter((t) => t.completed)
        : filter === "all"
          ? tasks.filter((t) => t.completed)
          : [];

    return {
      visible: sortList(pending.filter(matchesQuery)),
      completed: sortList(done.filter(matchesQuery)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, filter, query, sort]);


  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "today", label: "Today" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
  ];

  const sortLabel =
    sort === "due" ? "Due date" : sort === "priority" ? "Priority" : "Recently added";

  return (
    <div className="animate-fade-up">
      <ScreenHeader title="Tasks" subtitle="Small steps, steady progress." />

      <div className="space-y-5 px-5">
        {/* Today Progress */}
        <div className="nova-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                Today's Progress
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                <span className="text-lg font-semibold tracking-tight">{todayDone}</span>
                <span className="text-muted-foreground"> / {todayTotal} Tasks Completed</span>
              </p>
            </div>
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              {pct}%
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[oklch(0.82_0.13_85)] to-[oklch(0.68_0.14_75)] shadow-[0_0_12px_oklch(0.72_0.14_85/0.5)] transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
            className="w-full rounded-2xl border border-border/70 bg-card py-3 pl-11 pr-4 text-sm shadow-[var(--shadow-soft)] transition-all placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-[color:var(--ring)]"
          />
        </div>

        {/* Filters + Sort */}
        <div className="flex items-center gap-2">
          <div className="scrollbar-none flex flex-1 gap-1.5 overflow-x-auto">
            {filters.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "relative shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95",
                    active
                      ? "border-primary/50 bg-primary text-primary-foreground shadow-[var(--shadow-float)]"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-[var(--shadow-soft)] transition-all active:scale-95 hover:border-primary/30"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{sortLabel}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Sort by
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSort("due")}>Due date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("priority")}>Priority</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("recent")}>
                Recently added
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* List / Empty */}
        {visible.length === 0 ? (
          <div className="nova-card mt-2 flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[oklch(0.97_0.03_85)] to-[oklch(0.94_0.06_85)] shadow-[0_10px_28px_-10px_oklch(0.68_0.14_75/0.35)] ring-1 ring-[oklch(0.72_0.14_85/0.2)]">
              <ListChecks className="h-8 w-8 text-primary" strokeWidth={1.8} />
              <SparklesIcon className="absolute -right-1 -top-1 h-4 w-4 text-primary" />
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight">Nothing here yet</h3>
            <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
              {tasks.length === 0
                ? "Create your first task and start building momentum."
                : "No tasks match this view. Try another filter."}
            </p>
            <button
              type="button"
              onClick={() => {
                if (tasks.length === 0) navigate({ to: "/capture/task" });
                else quickCapture.open();
              }}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition-all hover:opacity-95 active:scale-95"
            >
              <Plus className="h-4 w-4" strokeWidth={2.6} />
              Create Task
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="flex items-center gap-1.5 pl-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <ListFilter className="h-3 w-3" />
              {visible.length} {visible.length === 1 ? "task" : "tasks"}
            </p>
            {visible.map((t, i) => (
              <TaskCard key={t.id} task={t} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
