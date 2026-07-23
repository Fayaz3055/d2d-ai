import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardCardProps = {
  icon: LucideIcon;
  title: string;
  hint?: string;
  badge?: string;
  className?: string;
  accent?: string; // tailwind color class for icon tint bg
};

export function DashboardCard({
  icon: Icon,
  title,
  hint,
  badge,
  className,
  accent = "bg-accent text-accent-foreground",
}: DashboardCardProps) {
  return (
    <button
      type="button"
      className={cn(
        "nova-card group relative flex h-full w-full flex-col items-start gap-4 p-5 text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl",
          accent,
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
          {badge ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {badge}
            </span>
          ) : null}
        </div>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </button>
  );
}
