import { Link } from "@tanstack/react-router";
import { Home, ListChecks, Calendar, Sparkles, User, type LucideIcon } from "lucide-react";

const items: { to: "/home" | "/tasks" | "/calendar" | "/ai" | "/profile"; label: string; icon: LucideIcon }[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/ai", label: "AI", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="nova-glass fixed inset-x-0 bottom-0 z-40 border-t border-border/60"
    >
      <ul className="mx-auto flex max-w-xl items-center justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="group flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors [&.active]:text-primary"
              activeProps={{ className: "active" }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg transition-all group-[.active]:bg-accent group-[.active]:text-accent-foreground group-[.active]:scale-105">
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
