import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { NovaLogo } from "@/components/nova/logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nova — Your Intelligent Daily Companion" },
      {
        name: "description",
        content:
          "D2D AI is a premium AI life assistant that helps students and professionals organize tasks, notes, and time in one calm space.",
      },
      { property: "og:title", content: "Nova — Your Intelligent Daily Companion" },
      {
        property: "og:description",
        content: "Your AI-powered life assistant. Your Intelligent Daily Companion",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/onboarding" }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* soft ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="flex flex-col items-center animate-fade-up">
        <NovaLogo size={84} />
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">Nova</h1>
        <p className="mt-3 text-sm text-muted-foreground">Your Intelligent Daily Companion</p>
      </div>

      <Link
        to="/onboarding"
        className="absolute bottom-10 text-xs font-medium text-muted-foreground/70 hover:text-foreground"
      >
        Skip
      </Link>
    </main>
  );
}
