import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";
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
  const [loading, setLoading] = useState(false);

  const onGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.redirected) return;
    if (result.error) {
      setLoading(false);
      toast.error("Google sign-in failed", {
        description: result.error.message ?? "Please try again.",
      });
      return;
    }
    window.location.assign("/home");
  };

  return (
    <button
      type="button"
      onClick={onGoogle}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2.5 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-[var(--shadow-soft)] transition-all hover:bg-accent active:scale-[0.98] disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.16v2.84A11 11 0 0 0 12 23Z"
          />
          <path
            fill="#FBBC05"
            d="M5.85 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.16a11 11 0 0 0 0 9.9l3.69-2.84Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.96.5 12 .5A11 11 0 0 0 2.16 7.05l3.69 2.84c.86-2.6 3.29-4.14 6.15-4.14Z"
          />
        </svg>
      )}
      Continue with Google
    </button>
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
