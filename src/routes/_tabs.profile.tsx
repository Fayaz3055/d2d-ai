import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  ChevronRight,
  ImagePlus,
  Loader2,
  LogOut,
  Mail,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/nova/screen-header";
import { Input } from "@/components/ui/input";
import { useSession, useProfile, displayNameOf } from "@/features/auth/use-auth";
import { clearAllCloudStores } from "@/features/storage/create-cloud-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_tabs/profile")({
  head: () => ({
    meta: [
      { title: "Profile — D2D AI" },
      { name: "description", content: "Your D2D AI account details and preferences." },
      { property: "og:title", content: "Profile — D2D AI" },
      { property: "og:description", content: "Your D2D AI account details." },
    ],
  }),
  component: Profile,
});

const APP_VERSION = "1.0.0";

function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const profile = useProfile(user);
  const name = displayNameOf(user, profile);
  const initial = name.charAt(0).toUpperCase();

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftAvatar, setDraftAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [nameOverride, setNameOverride] = useState<string | null>(null);

  const shownAvatar = avatar ?? profile?.avatar_url ?? null;
  const shownName = nameOverride ?? name;
  const created = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const startEdit = () => {
    setDraftName(shownName);
    setDraftAvatar(shownAvatar ?? "");
    setEditing(true);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: draftName.trim() || null, avatar_url: draftAvatar.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Couldn't save your profile", { description: "Please try again." });
      return;
    }
    setNameOverride(draftName.trim() || null);
    setAvatar(draftAvatar.trim() || null);
    setEditing(false);
    toast.success("Profile updated");
  };

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    clearAllCloudStores();
    await supabase.auth.signOut();
    navigate({ to: "/auth/sign-in", replace: true });
  };

  return (
    <div className="animate-fade-up">
      <ScreenHeader title="Profile" />

      {/* Identity card */}
      <div className="mx-5 nova-card p-6 text-center">
        <div className="relative mx-auto h-24 w-24">
          {shownAvatar ? (
            <img
              src={shownAvatar}
              alt={`${shownName}'s profile picture`}
              className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/25"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.82_0.11_88)] to-[oklch(0.62_0.14_75)] text-3xl font-semibold text-primary-foreground shadow-[var(--shadow-float)]">
              {initial}
            </div>
          )}
          <button
            type="button"
            onClick={startEdit}
            aria-label="Change profile picture"
            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[var(--shadow-float)] transition-transform active:scale-90"
          >
            <ImagePlus className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-4 truncate text-xl font-semibold tracking-tight">{shownName}</h2>
        <p className="mt-1 truncate text-sm text-muted-foreground">{user?.email ?? "—"}</p>

        {editing ? (
          <div className="mt-5 space-y-2.5 text-left">
            <Input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Display name"
              className="h-11 rounded-xl"
            />
            <Input
              value={draftAvatar}
              onChange={(e) => setDraftAvatar(e.target.value)}
              placeholder="Profile picture URL"
              className="h-11 rounded-xl"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={save}
                disabled={saving}
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-all active:scale-95"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Save
                  </>
                )}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-border text-sm font-semibold transition-all active:scale-95"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Account details */}
      <section className="mx-5 mt-6">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Account
        </p>
        <div className="nova-card divide-y divide-border overflow-hidden">
          <InfoRow icon={Mail} label="Email" value={user?.email ?? "—"} />
          <InfoRow icon={CalendarDays} label="Member since" value={created} />
        </div>
      </section>

      {/* General */}
      <section className="mx-5 mt-6">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          General
        </p>
        <div className="nova-card divide-y divide-border overflow-hidden">
          <button
            onClick={() => navigate({ to: "/settings" })}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent/40"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Settings className="h-4 w-4" />
            </div>
            <span className="flex-1 text-[15px] font-medium">Settings</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex w-full items-center gap-3 px-4 py-3.5 opacity-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Trash2 className="h-4 w-4" />
            </div>
            <span className="flex-1 text-[15px] font-medium">Delete account</span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Soon
            </span>
          </div>
        </div>
      </section>

      <section className="mx-5 mt-6">
        <button
          onClick={handleSignOut}
          className="nova-card flex w-full items-center gap-3 p-4 text-left text-destructive"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-medium">Sign out</span>
        </button>
      </section>

      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        D2D AI · v{APP_VERSION}
      </p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[15px] font-medium">{label}</span>
      <span className="ml-auto truncate text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
