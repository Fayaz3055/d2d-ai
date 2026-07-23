import { createFileRoute } from "@tanstack/react-router";
import {
  CheckSquare,
  Calendar,
  StickyNote,
  Brain,
  Bell,
  TrendingUp,
  Sparkles,
  BookOpen,
  Bell as BellIcon,
} from "lucide-react";
import { ScreenHeader } from "@/components/nova/screen-header";
import { DashboardCard } from "@/components/nova/dashboard-card";

export const Route = createFileRoute("/_tabs/home")({
  head: () => ({
    meta: [
      { title: "Home — Nova" },
      { name: "description", content: "Your calm daily overview in Nova." },
      { property: "og:title", content: "Home — Nova" },
      { property: "og:description", content: "Your calm daily overview." },
    ],
  }),
  component: Home,
});

const greet = () => {
  const h = new Date().getHours();
  if (h < 5) return "Still up?";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

function Home() {
  return (
    <div className="animate-fade-up">
      <ScreenHeader
        title={`${greet()}, Alex`}
        subtitle="Here's your day at a glance."
        right={
          <button
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <BellIcon className="h-4 w-4" />
          </button>
        }
      />

      {/* Focus strip */}
      <div className="mx-5 mt-2 rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.58_0.16_300)] p-5 text-primary-foreground shadow-[var(--shadow-float)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] opacity-80">
          Today's focus
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">
          A quiet mind, one task at a time.
        </h2>
        <p className="mt-2 text-sm opacity-85">
          You have 0 tasks scheduled — a fresh start awaits.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 px-5">
        <DashboardCard icon={CheckSquare} title="Today's Tasks" hint="Nothing pending" />
        <DashboardCard icon={Calendar} title="Calendar" hint="No events today" />
        <DashboardCard icon={StickyNote} title="Notes" hint="Capture an idea" />
        <DashboardCard icon={Brain} title="Thought Inbox" hint="0 unsorted" />
        <DashboardCard icon={Bell} title="Reminders" hint="All clear" />
        <DashboardCard icon={TrendingUp} title="Study Progress" hint="This week" />
        <DashboardCard
          icon={Sparkles}
          title="AI Daily Brief"
          badge="Soon"
          hint="Personalized summary"
          className="col-span-2"
        />
        <DashboardCard
          icon={BookOpen}
          title="PDF Library"
          badge="Soon"
          hint="Read & annotate"
          className="col-span-2"
        />
      </div>
    </div>
  );
}
