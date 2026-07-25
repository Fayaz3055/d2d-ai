import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  right,
  children,
  fallbackTo = "/home",
}: {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
  children: ReactNode;
  fallbackTo?: "/home" | "/tasks" | "/calendar" | "/notes" | "/thoughts" | "/reminders" | "/events";
}) {
  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.history.back();
    else router.navigate({ to: fallbackTo });
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-3 py-3 backdrop-blur-xl">
          <button
            type="button"
            onClick={goBack}
            className="-ml-1 flex h-10 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
          <div className="min-w-0 text-center">
            {eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="truncate text-[15px] font-semibold tracking-tight">{title}</h1>
          </div>
          <div className="flex min-w-16 items-center justify-end gap-1.5">{right}</div>
        </header>
        <div className="flex-1 px-5 pb-24 pt-6 animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
