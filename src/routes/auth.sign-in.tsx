import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, SocialButtons, Divider } from "@/features/auth/auth-shell";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError, isUnverifiedEmailError } from "@/features/auth/auth-errors";
import { PasswordField } from "@/features/auth/password-field";

export const Route = createFileRoute("/auth/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — D2D AI" },
      { name: "description", content: "Sign in to your D2D AI account." },
      { property: "og:title", content: "Sign in — D2D AI" },
      { property: "og:description", content: "Sign in to D2D AI." },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      if (isUnverifiedEmailError(error.message)) {
        toast.error("Email not verified", {
          description:
            "Your email hasn't been verified yet. Please verify your email before signing in.",
        });
        navigate({ to: "/auth/verify-email", search: { email: email.trim() } });
        return;
      }
      toast.error("Couldn't sign you in", { description: friendlyAuthError(error.message) });
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/home", replace: true });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your journey with D2D AI."
      backTo="/onboarding"
      footer={
        <span className="text-muted-foreground">
          New here?{" "}
          <Link to="/auth/sign-up" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </span>
      }
    >
      <SocialButtons />
      <Divider />

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <PasswordField
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 w-full rounded-full text-[15px]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
