import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Compass, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to D2D AI" },
      { name: "description", content: "A quick tour of Nova — your AI life assistant." },
      { property: "og:title", content: "Welcome to D2D AI" },
      { property: "og:description", content: "A quick tour of Nova." },
    ],
  }),
  component: Onboarding,
});

const slides = [
  {
    icon: Compass,
    eyebrow: "Welcome",
    title: "Meet D2D AI",
    body: "A calm, beautiful home for your tasks, notes, and thoughts — designed for a focused life.",
  },
  {
    icon: Sparkles,
    eyebrow: "AI-Powered",
    title: "Effortless organization",
    body: "D2D AI learns your rhythm. Capture anything and let intelligent structure emerge — without the busywork.",
  },
  {
    icon: Rocket,
    eyebrow: "Ready when you are",
    title: "Start your journey",
    body: "Build momentum every day. Study, work, and grow with a single trusted companion.",
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const isLast = step === slides.length - 1;
  const s = slides[step];
  const Icon = s.icon;

  const next = () => (isLast ? navigate({ to: "/auth/sign-up" }) : setStep((v) => v + 1));

  return (
    <main className="relative flex min-h-dvh flex-col bg-background px-6 pb-10 pt-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-accent/60 to-transparent" />

      <button
        type="button"
        onClick={() => navigate({ to: "/auth/sign-in" })}
        className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        Skip
      </button>

      <section key={step} className="mt-10 flex flex-1 flex-col items-center justify-center text-center animate-fade-up">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.62_0.18_310)] text-primary-foreground shadow-[var(--shadow-float)]">
          <Icon className="h-11 w-11" strokeWidth={1.8} />
        </div>
        <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          {s.eyebrow}
        </p>
        <h1 className="mt-3 max-w-sm text-3xl font-semibold tracking-tight">{s.title}</h1>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          {s.body}
        </p>
      </section>

      <div className="mt-8 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === step ? "w-6 bg-primary" : "w-1.5 bg-border",
            )}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Button size="lg" className="h-12 rounded-full text-[15px]" onClick={next}>
          {isLast ? "Get Started" : "Continue"}
        </Button>
        {step > 0 && !isLast ? (
          <button
            type="button"
            onClick={() => setStep((v) => v - 1)}
            className="mx-auto text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Back
          </button>
        ) : null}
      </div>
    </main>
  );
}
