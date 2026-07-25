import { createCollectionStore, type BaseItem } from "@/features/storage/create-collection-store";

export type NotificationKind = "task_completed" | "reminder" | "summary" | "info";

export type AppNotification = BaseItem & {
  kind: NotificationKind;
  title: string;
  description?: string;
  read: boolean;
};

const { store, useAll } = createCollectionStore<AppNotification>("d2d.notifications.v1");

export const notificationsStore = {
  ...store,
  push(input: { kind: NotificationKind; title: string; description?: string }) {
    return store.add({ ...input, read: false });
  },
  markAllRead() {
    const next = store.getAll().map((n) => ({ ...n, read: true }));
    store.replaceAll(next);
  },
  clearAll() {
    store.replaceAll([]);
  },
};

export const useNotifications = useAll;

export function useUnreadCount(): number {
  const all = useNotifications();
  return all.filter((n) => !n.read).length;
}
