import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/features/auth/auth-shell";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/features/auth/auth-errors";
import { PasswordField } from "@/features/auth/password-field";

export const Route = createFileRoute("/auth/sign-up")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/home" });
  },
  head: () => ({
    meta: [
      { title: "Create your account — D2D AI" },
      { name: "description", content: "Join D2D AI and start organizing your life." },
      { property: "og:title", content: "Create your account — D2D AI" },
      { property: "og:description", content: "Join D2D AI today." },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirm) {
      toast.error("Missing details", { description: "Please fill in every field." });
      return;
    }
    if (password.length < 8) {
      toast.error("Password too short", { description: "Use at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match", { description: "Re-enter the same password twice." });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: name.trim() } },
    });
    if (error) {
      setLoading(false);
      toast.error("Couldn't create your account", {
        description: friendlyAuthError(error.message),
      });
      return;
    }

    // Signups are confirmed automatically — sign in straight away if needed.
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setLoading(false);
        toast.error("Account created, but sign-in failed", {
          description: friendlyAuthError(signInError.message),
        });
        navigate({ to: "/auth/sign-in", replace: true });
        return;
      }
    }

    setLoading(false);
    toast.success("Welcome to D2D AI");
    navigate({ to: "/home", replace: true });
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your calm, organized life with D2D AI."
      backTo="/onboarding"
      footer={
        <span className="text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Chen"
            className="h-12 rounded-xl"
          />
        </div>
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
          <Label htmlFor="password">Password</Label>
          <PasswordField
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <PasswordField
            id="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Repeat your password"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 w-full rounded-full text-[15px]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing you agree to D2D AI's Terms and Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}
