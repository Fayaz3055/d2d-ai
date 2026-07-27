import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, SocialButtons, Divider } from "@/features/auth/auth-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/sign-up")({
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
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password too short", { description: "Use at least 8 characters." });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: name.trim() },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Couldn't create your account", { description: error.message });
      return;
    }
    if (data.session) {
      toast.success("Welcome to D2D AI");
      navigate({ to: "/home", replace: true });
      return;
    }
    toast.success("Check your inbox", {
      description: "Confirm your email to finish setting up your account.",
    });
    navigate({ to: "/auth/sign-in", replace: true });
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
      <SocialButtons />
      <Divider />

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
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="h-12 rounded-xl"
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
