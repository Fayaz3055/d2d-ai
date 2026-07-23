import { cn } from "@/lib/utils";

export function NovaLogo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-2xl",
        "bg-gradient-to-br from-primary to-[oklch(0.62_0.18_310)]",
        "shadow-[0_10px_30px_-8px_oklch(0.48_0.14_282/0.6)]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="text-primary-foreground"
        style={{ width: size * 0.55, height: size * 0.55 }}
      >
        <path
          d="M4 20V4l16 16V4"
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
      <span className="text-lg font-semibold tracking-tight">Nova</span>
    </div>
  );
}
