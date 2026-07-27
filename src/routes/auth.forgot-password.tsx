import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/features/auth/auth-shell";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — D2D AI" },
      { name: "description", content: "Recover access to your D2D AI account." },
      { property: "og:title", content: "Reset your password — D2D AI" },
      { property: "og:description", content: "Recover access to D2D AI." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error("Couldn't send the reset link", { description: error.message });
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="We'll email you a link to reset it."
      backTo="/auth/sign-in"
      footer={
        <span className="text-muted-foreground">
          Remembered it?{" "}
          <Link to="/auth/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      {sent ? (
        <div className="nova-card flex flex-col items-center p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={1.6} />
          <h3 className="mt-4 text-lg font-semibold">Check your inbox</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            If that email exists, a reset link is on its way.
          </p>
        </div>
      ) : (
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
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="h-12 w-full rounded-full text-[15px]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
