import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Brain,
  ChevronRight,
  LineChart,
  Info,
  Monitor,
  Moon,
  ShieldCheck,
  Sun,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/nova/page-shell";
import { Switch } from "@/components/ui/switch";
import { useTheme, type Theme } from "@/lib/theme-provider";
import { settingsStore, useSettings, useSettingsSync } from "@/features/settings/use-settings";
import { cn } from "@/lib/utils";

export const APP_VERSION = "1.0.0";

export const Route = createFileRoute("/settings")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Settings — D2D AI" },
      { name: "description", content: "Theme, notifications, privacy and app preferences." },
      { property: "og:title", content: "Settings — D2D AI" },
      { property: "og:description", content: "Manage your D2D AI preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const settings = useSettings();
  const [open, setOpen] = useState<string | null>(null);
  useSettingsSync((t) => setTheme(t as Theme));

  return (
    <PageShell eyebrow="Preferences" title="Settings">
      {/* Theme */}
      <section>
        <SectionLabel>Appearance</SectionLabel>
        <div className="nova-card p-1.5">
          <div className="grid grid-cols-3 gap-1">
            {(
              [
                { v: "light" as Theme, label: "Light", icon: Sun },
                { v: "system" as Theme, label: "System", icon: Monitor },
                { v: "dark" as Theme, label: "Dark", icon: Moon },
              ]
            ).map(({ v, label, icon: Icon }) => (
              <button
                key={v}
                onClick={() => {
                  setTheme(v);
                  settingsStore.set({ theme: v });
                }}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-medium transition-all active:scale-95",
                  theme === v
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-float)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="mt-6">
        <SectionLabel>Notifications</SectionLabel>
        <div className="nova-card flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Bell className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium">Push notifications</p>
            <p className="text-xs text-muted-foreground">Reminders, summaries and nudges.</p>
          </div>
          <Switch
            checked={settings.notificationsEnabled}
            onCheckedChange={(v) => settingsStore.set({ notificationsEnabled: v })}
          />
        </div>
      </section>

      {/* AI Companion */}
      <section className="mt-6">
        <SectionLabel>AI Companion</SectionLabel>
        <div className="nova-card divide-y divide-border overflow-hidden">
          <Link to="/ai-memory" className="flex items-center gap-3 p-4 transition-colors active:bg-accent/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Brain className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium">AI Memory</p>
              <p className="text-xs text-muted-foreground">See and edit what your companion remembers.</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
          <Link to="/insights" className="flex items-center gap-3 p-4 transition-colors active:bg-accent/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <LineChart className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium">Weekly Insights</p>
              <p className="text-xs text-muted-foreground">Your AI review of the week.</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </div>
      </section>

      {/* General */}
      <section className="mt-6">
        <SectionLabel>General</SectionLabel>
        <div className="nova-card divide-y divide-border overflow-hidden">
          <ExpandRow
            icon={UserCog}
            label="Account Settings"
            open={open === "account"}
            onToggle={() => setOpen(open === "account" ? null : "account")}
          >
            Manage your name, email and password from the Profile screen. Password changes are sent
            securely to your inbox via the "Forgot password" flow.
          </ExpandRow>
          <ExpandRow
            icon={ShieldCheck}
            label="Privacy"
            open={open === "privacy"}
            onToggle={() => setOpen(open === "privacy" ? null : "privacy")}
          >
            Your tasks, notes, thoughts, events and reminders are stored privately in your account.
            Row-level security means only you can read or change your data — never other users.
          </ExpandRow>
          <ExpandRow
            icon={Info}
            label="About D2D AI"
            open={open === "about"}
            onToggle={() => setOpen(open === "about" ? null : "about")}
          >
            D2D AI is your intelligent daily companion — a calm, premium space to capture tasks,
            notes and ideas, and let them stay in sync across every device you sign in on.
          </ExpandRow>
        </div>
      </section>

      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        D2D AI · Version {APP_VERSION}
      </p>
    </PageShell>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

function ExpandRow({
  icon: Icon,
  label,
  open,
  onToggle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent/40"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <span className="flex-1 text-[15px] font-medium">{label}</span>
        <ChevronRight
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-300",
            open && "rotate-90",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-4 text-[13px] leading-relaxed text-muted-foreground">{children}</p>
        </div>
      </div>
    </div>
  );
}
