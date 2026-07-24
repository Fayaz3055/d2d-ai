import { cn } from "@/lib/utils";
import type { Priority, Category } from "./types";

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-accent text-accent-foreground border-[oklch(0.85_0.08_85)]",
  high: "bg-[oklch(0.96_0.05_25)] text-[oklch(0.55_0.18_25)] border-[oklch(0.88_0.08_25)] dark:bg-[oklch(0.28_0.08_25)] dark:text-[oklch(0.85_0.1_25)]",
};

const CATEGORY_STYLES: Record<Category, string> = {
  study: "bg-[oklch(0.96_0.04_260)] text-[oklch(0.45_0.14_260)] border-[oklch(0.88_0.06_260)] dark:bg-[oklch(0.28_0.06_260)] dark:text-[oklch(0.85_0.08_260)]",
  personal: "bg-accent text-accent-foreground border-[oklch(0.88_0.06_85)]",
  work: "bg-[oklch(0.96_0.04_200)] text-[oklch(0.45_0.13_200)] border-[oklch(0.88_0.06_200)] dark:bg-[oklch(0.28_0.06_200)] dark:text-[oklch(0.85_0.08_200)]",
  health: "bg-[oklch(0.96_0.05_150)] text-[oklch(0.45_0.14_150)] border-[oklch(0.88_0.07_150)] dark:bg-[oklch(0.28_0.07_150)] dark:text-[oklch(0.85_0.09_150)]",
  other: "bg-muted text-muted-foreground border-border",
};

export function PriorityBadge({ value }: { value: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        PRIORITY_STYLES[value],
      )}
    >
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        value === "high" && "bg-[oklch(0.6_0.2_25)]",
        value === "medium" && "bg-primary",
        value === "low" && "bg-muted-foreground/60",
      )} />
      {value}
    </span>
  );
}

export function CategoryBadge({ value }: { value: Category }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize tracking-wide",
        CATEGORY_STYLES[value],
      )}
    >
      {value}
    </span>
  );
}
