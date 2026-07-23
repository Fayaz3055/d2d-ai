import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Moon, Sun, Monitor, Settings, Info, LogOut, ChevronRight } from "lucide-react";
import { ScreenHeader } from "@/components/nova/screen-header";
import { useTheme, type Theme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs/profile")({
  head: () => ({
    meta: [
      { title: "Profile — D2D AI" },
      { name: "description", content: "Your D2D AI account and preferences." },
      { property: "og:title", content: "Profile — D2D AI" },
      { property: "og:description", content: "Your D2D AI account and preferences." },
    ],
  }),
  component: Profile,
});

const APP_VERSION = "0.1.0";

function Profile() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-up">
      <ScreenHeader title="Profile" />

      {/* Profile card */}
      <div className="mx-5 nova-card flex items-center gap-4 p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.78_0.13_85)] to-[oklch(0.62_0.14_75)] text-lg font-semibold text-white">
          A
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold tracking-tight">Alex Chen</div>
          <div className="truncate text-sm text-muted-foreground">alex@example.com</div>
        </div>
        <button className="text-xs font-medium text-primary hover:underline">Edit</button>
      </div>

      {/* Appearance */}
      <section className="mx-5 mt-6">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Appearance
        </p>
        <div className="nova-card p-1.5">
          <div className="grid grid-cols-3 gap-1">
            {(
              [
                { v: "light" as Theme, label: "Light", icon: Sun },
                { v: "system" as Theme, label: "Auto", icon: Monitor },
                { v: "dark" as Theme, label: "Dark", icon: Moon },
              ]
            ).map(({ v, label, icon: Icon }) => (
              <button
                key={v}
                onClick={() => setTheme(v)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-medium transition-colors",
                  theme === v
                    ? "bg-accent text-accent-foreground"
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

      {/* Menu */}
      <section className="mx-5 mt-6">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          General
        </p>
        <div className="nova-card divide-y divide-border overflow-hidden">
          <Row icon={Settings} label="Settings" />
          <Row icon={Info} label="About D2D AI" />
        </div>
      </section>

      <section className="mx-5 mt-6">
        <button
          onClick={() => navigate({ to: "/auth/sign-in" })}
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

function Row({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-accent/40 transition-colors">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
