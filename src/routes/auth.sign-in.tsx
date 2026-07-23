import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, SocialButtons, Divider } from "@/features/auth/auth-shell";

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

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/home" });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" className="h-12 rounded-xl" />
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
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-12 rounded-xl"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 w-full rounded-full text-[15px]">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
