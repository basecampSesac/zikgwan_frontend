import { useEffect, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function NotificationSse() {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!user?.userId) return;

    const eventSource = new EventSourcePolyfill(
      `${API_URL}/api/sse/subscribe/${user.userId}`,
      {
        heartbeatTimeout: 300000,
      }
    );

    eventSourceRef.current = eventSource;

    eventSource.addEventListener("connect", (event: any) => {
      console.log("SSE 연결 성공:", event.data);
    });

    eventSource.addEventListener("chat-notification", (event: any) => {
      const data = JSON.parse(event.data);
      console.log("새 알림 수신:", data);
      addNotification(data); // 🔥 전역 상태에 추가
    });

    eventSource.onerror = (err) => {
      console.error("SSE 연결 오류:", err);
      eventSource.close();
    };

    return () => {
      console.log("SSE 연결 해제");
      eventSource.close();
    };
  }, [user?.userId, addNotification]);

  return null;
}
