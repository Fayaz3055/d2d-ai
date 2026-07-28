import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/features/auth/auth-shell";
import { PasswordField } from "@/features/auth/password-field";
import { friendlyAuthError } from "@/features/auth/auth-errors";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password — D2D AI" },
      { name: "description", content: "Choose a new password for your D2D AI account." },
      { property: "og:title", content: "Set a new password — D2D AI" },
      { property: "og:description", content: "Choose a new D2D AI password." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password too short", { description: "Use at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("Couldn't update your password", { description: friendlyAuthError(error.message) });
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/home", replace: true });
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose something secure you'll remember."
      backTo="/auth/sign-in"
    >
      {!ready ? (
        <div className="nova-card p-8 text-center text-sm text-muted-foreground">
          Open this page from the reset link in your email to continue.
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <PasswordField
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <PasswordField
              id="confirm"
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
