import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Wand2, Compass, MessageSquare } from "lucide-react";
import { ScreenHeader } from "@/components/nova/screen-header";

export const Route = createFileRoute("/_tabs/ai")({
  head: () => ({
    meta: [
      { title: "AI Assistant — D2D AI" },
      { name: "description", content: "Your calm, personal AI companion." },
      { property: "og:title", content: "AI Assistant — D2D AI" },
      { property: "og:description", content: "Your calm, personal AI companion." },
    ],
  }),
  component: AI,
});

const suggestions = [
  { icon: Wand2, label: "Plan my week", hint: "Turn goals into a gentle schedule" },
  { icon: Compass, label: "Study companion", hint: "Break topics into steps" },
  { icon: MessageSquare, label: "Reflect on today", hint: "A short guided journal" },
];

function AI() {
  return (
    <div className="animate-fade-up">
      <ScreenHeader title="D2D AI" subtitle="Your quiet, thoughtful companion." />

      <div className="mx-5 rounded-3xl bg-gradient-to-br from-[oklch(0.78_0.13_85)] to-[oklch(0.62_0.14_75)] p-6 text-white shadow-[var(--shadow-float)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight">
          Something magical is coming.
        </h2>
        <p className="mt-2 text-sm opacity-85">
          D2D AI will help you plan, study, and reflect — all in one calm space.
        </p>
      </div>

      <div className="mt-6 px-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          A taste of what's next
        </p>
        <div className="flex flex-col gap-2.5">
          {suggestions.map((s) => (
            <button
              key={s.label}
              className="nova-card flex items-center gap-4 p-4 text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold tracking-tight">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.hint}</div>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Soon
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
