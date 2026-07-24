import { useSyncExternalStore } from "react";

let open = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const quickCapture = {
  isOpen: () => open,
  open() {
    if (open) return;
    open = true;
    emit();
  },
  close() {
    if (!open) return;
    open = false;
    emit();
  },
  toggle() {
    open = !open;
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useQuickCaptureOpen() {
  return useSyncExternalStore(
    quickCapture.subscribe,
    () => open,
    () => false,
  );
}
