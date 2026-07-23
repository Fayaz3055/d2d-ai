import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { NovaLogo } from "@/components/nova/logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  backTo,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  backTo?: string;
}) {
  return (
    <main className="relative min-h-dvh bg-background px-6 pb-10 pt-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[360px] bg-gradient-to-b from-accent/50 to-transparent" />

      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex items-center justify-between">
          {backTo ? (
            <Link
              to={backTo}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span />
          )}
          <NovaLogo size={40} />
          <span className="h-10 w-10" />
        </div>

        <div className="mt-10 animate-fade-up">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <div className="mt-8">{children}</div>

        {footer ? <div className="mt-6 text-center text-sm">{footer}</div> : null}
      </div>
    </main>
  );
}

export function SocialButtons() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {["Google", "Apple", "GitHub"].map((p) => (
        <button
          key={p}
          type="button"
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {p}
        </button>
      ))}
    </div>
  );
}

export function Divider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
