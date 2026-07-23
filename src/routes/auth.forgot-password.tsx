import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/features/auth/auth-shell";
import { CheckCircle2 } from "lucide-react";

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
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" className="h-12 rounded-xl" />
          </div>
          <Button type="submit" size="lg" className="h-12 w-full rounded-full text-[15px]">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
