import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function CapturePage({
  title,
  eyebrow,
  isDirty,
  onSave,
  saveDisabled,
  children,
  saveLabel = "Save",
}: {
  title: string;
  eyebrow?: string;
  isDirty: boolean;
  onSave: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const goBack = () => {
    if (window.history.length > 1) router.history.back();
    else router.navigate({ to: "/home" });
  };

  const handleCancel = () => {
    if (isDirty) setConfirmOpen(true);
    else goBack();
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-3 py-3 backdrop-blur-xl">
          <button
            type="button"
            onClick={handleCancel}
            className="-ml-1 flex h-10 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Cancel
          </button>
          <div className="min-w-0 text-center">
            {eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="truncate text-[15px] font-semibold tracking-tight">{title}</h1>
          </div>
          <button
            type="button"
            onClick={onSave}
            disabled={saveDisabled}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition-all",
              "bg-primary text-primary-foreground shadow-[var(--shadow-float)]",
              "hover:opacity-95 active:scale-[0.97]",
              "disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
            )}
          >
            {saveLabel}
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 px-5 pb-24 pt-6 animate-fade-in">{children}</div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. They'll be lost if you leave now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={goBack}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------- Reusable field primitives ---------- */

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
          {required ? <span className="ml-1 text-primary">*</span> : null}
        </span>
        {hint ? <span className="text-[11px] text-muted-foreground/70">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

export const fieldInputCn =
  "w-full rounded-2xl border border-border/70 bg-card px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 shadow-[var(--shadow-soft)] transition-all focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-[color:var(--ring)]";

export function ChipRow<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all active:scale-95",
              active
                ? "border-primary/50 bg-primary/10 text-primary shadow-[var(--shadow-soft)]"
                : "border-border/70 bg-card text-foreground hover:border-primary/30",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
