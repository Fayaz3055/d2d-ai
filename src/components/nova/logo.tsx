import { cn } from "@/lib/utils";

export function NovaLogo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-2xl",
        "bg-gradient-to-br from-[oklch(0.82_0.13_85)] to-[oklch(0.68_0.14_75)]",
        "shadow-[0_10px_28px_-10px_oklch(0.68_0.14_75/0.55)]",
        "ring-1 ring-[oklch(0.68_0.14_75/0.25)]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="text-white"
        style={{ width: size * 0.55, height: size * 0.55 }}
      >
        <path
          d="M4 20V4h6a5 5 0 0 1 0 10H4M14 20l6-16"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function NovaWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <NovaLogo size={32} />
      <span className="text-lg font-semibold tracking-tight">D2D AI</span>
    </div>
  );
}
