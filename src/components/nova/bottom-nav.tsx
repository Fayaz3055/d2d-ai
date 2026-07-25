import { Link } from "@tanstack/react-router";
import { Home, ListChecks, Calendar, Sparkles, Plus, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { quickCapture, useQuickCaptureOpen } from "@/features/quick-capture/quick-capture-store";

const leftItems: { to: "/home" | "/tasks"; label: string; icon: LucideIcon }[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
];
const rightItems: { to: "/calendar" | "/ai"; label: string; icon: LucideIcon }[] = [
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/ai", label: "AI", icon: Sparkles },
];

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: LucideIcon }) {
  return (
    <li className="flex-1">
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
  );
}

export function BottomNav() {
  const open = useQuickCaptureOpen();
  return (
    <nav
      aria-label="Primary"
      className="nova-glass fixed inset-x-0 bottom-0 z-40 border-t border-border/60"
    >
      <div className="relative mx-auto max-w-xl">
        {/* Center FAB — overlaps nav, ~50% above/50% inside */}
        <button
          type="button"
          aria-label="Quick capture"
          aria-expanded={open}
          onClick={() => quickCapture.toggle()}
          className={cn(
            "absolute left-1/2 -top-7 z-50 -translate-x-1/2",
            "flex h-[60px] w-[60px] items-center justify-center rounded-full",
            "bg-gradient-to-br from-[oklch(0.82_0.13_85)] to-[oklch(0.68_0.14_75)]",
            "text-white",
            "shadow-[0_14px_36px_-8px_oklch(0.68_0.14_75/0.55),0_0_0_6px_var(--background),0_0_28px_oklch(0.72_0.14_85/0.35)]",
            "ring-1 ring-[oklch(0.68_0.14_75/0.3)]",
            "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "hover:scale-[1.06] active:scale-[0.92]",
            open && "rotate-[135deg]",
          )}
        >
          {open ? <X className="h-6 w-6" strokeWidth={2.4} /> : <Plus className="h-6 w-6" strokeWidth={2.6} />}
        </button>

        <ul className="flex items-center px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
          {leftItems.map((it) => (
            <NavItem key={it.to} {...it} />
          ))}
          {/* Spacer for FAB */}
          <li aria-hidden className="w-[70px] flex-none" />
          {rightItems.map((it) => (
            <NavItem key={it.to} {...it} />
          ))}
        </ul>
      </div>
    </nav>
  );
}
