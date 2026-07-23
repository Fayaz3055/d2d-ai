import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "nova-card flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <h3 className="mt-5 text-base font-semibold tracking-tight">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
