import { useCallback, useEffect, useState } from "react";
import type { LifeContext } from "./context";
import { getDailyBriefing, type DailyBriefing } from "./ai-insights.functions";

const KEY = "d2d.ai.briefing";

type Cached = { date: string; slot: string; briefing: DailyBriefing };

/** morning / afternoon / evening — the briefing refreshes when the slot changes. */
function slotOf(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function read(): Cached | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Cached) : null;
  } catch {
    return null;
  }
}

/**
 * Generates the AI home briefing once per part of day and caches it locally so
 * the home screen stays instant and cheap on mobile.
 */
export function useDailyBriefing(context: LifeContext, ready: boolean) {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = useCallback(
    async (force: boolean) => {
      const slot = slotOf();
      if (!force) {
        const cached = read();
        if (cached && cached.date === context.today && cached.slot === slot) {
          setBriefing(cached.briefing);
          return;
        }
      }
      setLoading(true);
      try {
        const result = await getDailyBriefing({ data: { context: JSON.stringify(context) } });
        if (result.greeting || result.plan.length) {
          setBriefing(result);
          try {
            localStorage.setItem(
              KEY,
              JSON.stringify({ date: context.today, slot, briefing: result } satisfies Cached),
            );
          } catch {
            /* storage full or unavailable */
          }
        }
      } catch (error) {
        console.error("[ai] briefing failed", error);
      } finally {
        setLoading(false);
      }
    },
    [context],
  );

  useEffect(() => {
    if (!ready) return;
    void generate(false);
    // Intentionally only re-runs when data readiness flips, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return { briefing, loading, refresh: () => void generate(true) };
}
