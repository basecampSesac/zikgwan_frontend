import { useEffect, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface ChatNotification {
  roomId: number;
  sender: string;
  message: string;
  sentAt: string;
}

export default function NotificationSse() {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!user?.userId) return;

    // SSE 연결
    const eventSource = new EventSourcePolyfill(
      `${API_URL}/api/sse/subscribe/${user.userId}`,

      // jwt 인증 추가 시 주석 해제
      {
        // headers: {
        //   Authorization: `Bearer ${accessToken}`, // JWT 토큰 헤더
        // },
        heartbeatTimeout: 300000, // 서버와의 연결 유지 간격 5분
        withCredentials: false, // (필요 시 주석 해제)
      }
    );

    eventSourceRef.current = eventSource;

    eventSource.addEventListener("ping", (event) => {
      const e = event as MessageEvent<string>;
      console.log("서버 heartbeat:", e.data);
    });

    eventSource.addEventListener("connect", (event) => {
      const e = event as MessageEvent<string>;
      console.log("SSE 연결 성공:", e.data);
    });

    eventSource.addEventListener("chat-notification", (event) => {
      const e = event as MessageEvent<string>;
      const data: ChatNotification = JSON.parse(e.data);
      console.log("새 알림 수신:", data);
      addNotification(data);
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
