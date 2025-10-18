import { create } from "zustand";

interface Notification {
  roomId: number;
  message: string;
}

interface NotificationState {
  notifications: Notification[];
  hasUnread: boolean;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  hasUnread: false,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      hasUnread: true, // 새 알림 오면 빨간 점 표시
    })),
  clearNotifications: () =>
    set({
      notifications: [],
      hasUnread: false,
    }),
  markAllRead: () =>
    set((state) => ({
      ...state,
      hasUnread: false,
    })),
}));
