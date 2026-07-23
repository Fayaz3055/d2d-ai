import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, SocialButtons, Divider } from "@/features/auth/auth-shell";

export const Route = createFileRoute("/auth/sign-up")({
  head: () => ({
    meta: [
      { title: "Create your account — Nova" },
      { name: "description", content: "Join Nova and start organizing your life." },
      { property: "og:title", content: "Create your account — Nova" },
      { property: "og:description", content: "Join Nova today." },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your calm, organized life with Nova."
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

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/home" });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Alex Chen" className="h-12 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" className="h-12 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            className="h-12 rounded-xl"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 w-full rounded-full text-[15px]">
          Create account
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing you agree to Nova's Terms and Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}
