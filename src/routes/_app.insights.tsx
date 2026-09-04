import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarCheck, Flame, Sparkles, TrendingUp, RefreshCw } from "lucide-react";
import { PageShell } from "@/components/nova/page-shell";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useLifeContext } from "@/features/ai/context";
import { getWeeklyInsights, type WeeklyInsights } from "@/features/ai/ai-insights.functions";
import { useTasks } from "@/features/tasks/use-tasks";

export const Route = createFileRoute("/insights")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Weekly Insights — D2D AI" },
      {
        name: "description",
        content: "Your AI weekly review: tasks completed, productivity trend and next priorities.",
      },
      { property: "og:title", content: "Weekly Insights — D2D AI" },
      { property: "og:description", content: "See how your week went, reviewed by D2D AI." },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const context = useLifeContext();
  const tasks = useTasks();
  const [insights, setInsights] = useState<WeeklyInsights | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    void getWeeklyInsights({ data: { context: JSON.stringify(context) } })
      .then(setInsights)
      .catch((error) => console.error("[ai] insights failed", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Generated once per visit; the refresh button regenerates on demand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks.length === 0]);

  const { completedThisWeek, completedLastWeek } = context.counts;
  const delta = completedThisWeek - completedLastWeek;
  const bestDay =
    insights?.mostProductiveDay ||
    Object.entries(context.completionsByWeekday).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "—";

  return (
    <PageShell eyebrow="AI Review" title="Weekly Insights">
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={CalendarCheck} label="Completed" value={String(completedThisWeek)} />
        <Stat
          icon={TrendingUp}
          label="vs last week"
          value={`${delta > 0 ? "+" : ""}${delta}`}
        />
        <Stat icon={Flame} label="Best day" value={bestDay.slice(0, 3)} />
      </div>

      <section className="nova-card mt-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
            Your week, reviewed
          </p>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            aria-label="Regenerate insights"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
          >
            <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          </button>
        </div>

        {loading && !insights ? (
          <Shimmer className="mt-3 text-[13px]">Reviewing your week…</Shimmer>
        ) : (
          <div className="mt-2 space-y-3">
            {insights?.summary ? (
              <p className="text-[13px] leading-relaxed text-foreground">{insights.summary}</p>
            ) : (
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Not enough activity yet this week — complete a few tasks and check back.
              </p>
            )}
            {insights?.trend ? (
              <p className="text-[13px] leading-relaxed text-muted-foreground">{insights.trend}</p>
            ) : null}
          </div>
        )}
      </section>

      {insights?.priorities?.length ? (
        <section className="mt-4">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Upcoming priorities
          </p>
          <ul className="nova-card divide-y divide-border/60 overflow-hidden p-0">
            {insights.priorities.slice(0, 3).map((p, i) => (
              <li key={i} className="flex items-start gap-3 px-3.5 py-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <p className="min-w-0 flex-1 text-[13px] leading-relaxed">{p}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {insights?.encouragement ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-[13px] leading-relaxed text-foreground">{insights.encouragement}</p>
        </div>
      ) : null}
    </PageShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="nova-card flex flex-col items-center gap-1 px-2 py-3.5">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-base font-semibold tracking-tight">{value}</span>
      <span className="text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
