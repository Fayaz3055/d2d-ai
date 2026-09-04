import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { ChevronLeft, Bell, CheckCircle2, BellRing, Sparkles, Info, MailCheck, Trash2 } from "lucide-react";
import {
  useNotifications,
  notificationsStore,
  type AppNotification,
} from "@/features/notifications/use-notifications";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/nova/empty-state";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — D2D AI" },
      { name: "description", content: "Your alerts, updates, and daily summary." },
      { property: "og:title", content: "Notifications — D2D AI" },
      { property: "og:description", content: "Your alerts and updates." },
    ],
  }),
  component: NotificationsPage,
});

const ICONS: Record<AppNotification["kind"], React.ComponentType<{ className?: string }>> = {
  task_completed: CheckCircle2,
  reminder: BellRing,
  summary: Sparkles,
  info: Info,
};

function relTime(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function NotificationsPage() {
  const router = useRouter();
  const items = useNotifications();
  const sorted = [...items].sort((a, b) => b.createdAt - a.createdAt);

  const goBack = () => {
    if (window.history.length > 1) router.history.back();
    else router.navigate({ to: "/home" });
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-3 py-3 backdrop-blur-xl">
          <button
            type="button"
            onClick={goBack}
            className="-ml-1 flex h-10 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
            Notifications
          </p>
          <span className="w-16" />
        </header>

        <div className="flex-1 px-5 pb-24 pt-6 animate-fade-in">
          {sorted.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="You're all caught up"
              description="Task completions, reminders, and your daily summary will appear here."
            />
          ) : (
            <>
              <div className="mb-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => notificationsStore.markAllRead()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-[var(--shadow-soft)] transition-all active:scale-95"
                >
                  <MailCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={() => notificationsStore.clearAll()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-background px-3 py-1.5 text-xs font-semibold text-destructive transition-all active:scale-95 hover:bg-destructive/5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear all
                </button>
              </div>

              <ul className="space-y-2">
                {sorted.map((n) => {
                  const Icon = ICONS[n.kind];
                  return (
                    <li key={n.id}>
                      <div
                        className={cn(
                          "nova-card flex items-start gap-3 p-4",
                          !n.read && "border-primary/40",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 flex-none items-center justify-center rounded-xl",
                            !n.read ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <p className="truncate text-[15px] font-semibold tracking-tight">
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                            )}
                          </div>
                          {n.description ? (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {n.description}
                            </p>
                          ) : null}
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                            {relTime(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <div className="mt-6">
            <div className="nova-card flex items-center gap-3 p-4 opacity-70">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-semibold tracking-tight">Daily Summary</p>
                  <span className="rounded-full border border-primary/30 bg-primary/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                    Soon
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your AI-generated daily brief will appear here.
                </p>
              </div>
            </div>
          </div>


          <div className="mt-8 text-center">
            <Link to="/home" className="text-xs font-semibold text-primary hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
