import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/features/auth/auth-shell";
import { friendlyAuthError } from "@/features/auth/auth-errors";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/verify-email")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  head: () => ({
    meta: [
      { title: "Verify your email — D2D AI" },
      {
        name: "description",
        content: "Confirm your email address to finish setting up your D2D AI account.",
      },
      { property: "og:title", content: "Verify your email — D2D AI" },
      { property: "og:description", content: "Confirm your email to start using D2D AI." },
    ],
  }),
  component: VerifyEmail,
});

function VerifyEmail() {
  const { email } = useSearch({ from: "/auth/verify-email" });
  const navigate = useNavigate();
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async () => {
    if (!email) {
      toast.error("We don't have your email address", {
        description: "Please sign up again to receive a new link.",
      });
      return;
    }
    setSending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);
    if (error) {
      toast.error("Couldn't resend the email", { description: friendlyAuthError(error.message) });
      return;
    }
    setCooldown(60);
    toast.success("Verification email sent", { description: `We've emailed ${email} again.` });
  };

  return (
    <AuthShell
      title="Almost there"
      subtitle="One quick step before you get started."
      backTo="/auth/sign-in"
    >
      <div className="nova-card flex flex-col items-center gap-5 p-7 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.9_0.08_92)] to-[oklch(0.78_0.13_85)] shadow-[var(--shadow-float)]">
          <MailCheck className="h-9 w-9 text-primary-foreground" strokeWidth={1.8} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Check your email</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We've sent a verification link to your email address. Please verify your email before
            signing in.
          </p>
          {email ? (
            <p className="pt-1 text-[15px] font-semibold tracking-tight text-foreground">{email}</p>
          ) : null}
        </div>

        <div className="w-full space-y-2.5 pt-1">
          <a href="mailto:" className="block">
            <Button size="lg" className="h-12 w-full rounded-full text-[15px]" type="button">
              Open Email App
            </Button>
          </a>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={sending || cooldown > 0}
            onClick={resend}
            className="h-12 w-full rounded-full text-[15px]"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              "Resend Verification Email"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => navigate({ to: "/auth/sign-in", replace: true })}
            className="h-12 w-full rounded-full text-[15px]"
          >
            Back to Login
          </Button>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Wrong address?{" "}
        <Link to="/auth/sign-up" className="font-medium text-primary hover:underline">
          Sign up again
        </Link>
      </p>
    </AuthShell>
  );
}
