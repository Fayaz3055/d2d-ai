import { Link } from "@tanstack/react-router";
import { RefreshCw, Sparkles, ArrowRight } from "lucide-react";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { queueAiPrompt } from "../pending-prompt";
import type { DailyBriefing } from "../ai-insights.functions";
import companionMark from "@/assets/ai-companion.png";

/**
 * The AI-powered top of the home screen: personal greeting, smart daily plan
 * and tappable AI suggestions that continue the conversation.
 */
export function AiBriefingCard({
  greetingPrefix,
  briefing,
  loading,
  onRefresh,
}: {
  greetingPrefix: string;
  briefing: DailyBriefing | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <section className="nova-card animate-fade-up overflow-hidden p-4">
      <div className="flex items-start gap-3">
        <img src={companionMark} alt="" width={40} height={40} className="h-9 w-9 shrink-0" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight">{greetingPrefix}</h1>
          <div className="mt-1 min-h-[2.5rem] text-[13px] leading-relaxed text-muted-foreground">
            {briefing?.greeting ? (
              <p className="animate-fade-up">{briefing.greeting}</p>
            ) : loading ? (
              <Shimmer className="text-[13px]">Reading your day…</Shimmer>
            ) : (
              <p>Here's your day at a glance. Ask me anything to get started.</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh AI briefing"
          className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
        >
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
        </button>
      </div>

      {briefing?.plan?.length ? (
        <ul className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
          {briefing.plan.slice(0, 4).map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 text-foreground">{step}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {briefing?.suggestions?.length ? (
        <div className="scrollbar-none -mx-1 mt-3 flex gap-2 overflow-x-auto px-1">
          {briefing.suggestions.slice(0, 4).map((s) => (
            <Link
              key={s}
              to="/ai"
              onClick={() => queueAiPrompt(s)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary/[0.06] px-3 py-1.5 text-[11px] font-semibold text-primary transition-all active:scale-95"
            >
              <Sparkles className="h-3 w-3" />
              {s}
            </Link>
          ))}
        </div>
      ) : null}

      <Link
        to="/ai"
        className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-border/70 bg-accent/40 px-3.5 py-2.5 transition-colors active:bg-accent"
      >
        <span className="text-[13px] font-semibold tracking-tight">Continue AI conversation</span>
        <ArrowRight className="h-3.5 w-3.5 text-primary" />
      </Link>
    </section>
  );
}
