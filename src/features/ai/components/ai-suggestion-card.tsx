import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Lightbulb, X } from "lucide-react";
import { suggestForCapture } from "../ai-suggest.functions";

/**
 * Non-intrusive AI suggestion for a capture draft. Appears once the draft has
 * enough content, and can be dismissed.
 */
export function AiSuggestionCard({
  kind,
  text,
}: {
  kind: "task" | "note" | "thought" | "event";
  text: string;
}) {
  const suggest = useServerFn(suggestForCapture);
  const [suggestion, setSuggestion] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [asked, setAsked] = useState(false);

  const trimmed = text.trim();
  const ready = trimmed.length >= 6;

  useEffect(() => {
    if (!ready || asked || dismissed) return;
    const timer = setTimeout(() => {
      setAsked(true);
      void suggest({ data: { kind, text: trimmed } })
        .then((r) => setSuggestion(r.suggestion))
        .catch(() => setSuggestion(""));
    }, 1200);
    return () => clearTimeout(timer);
  }, [ready, asked, dismissed, kind, trimmed, suggest]);

  if (dismissed || !suggestion) return null;

  return (
    <div className="animate-fade-up rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Lightbulb className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
            D2D AI
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-foreground">{suggestion}</p>
        </div>
        <button
          type="button"
          aria-label="Dismiss suggestion"
          onClick={() => setDismissed(true)}
          className="rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
