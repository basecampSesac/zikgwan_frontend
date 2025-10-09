import { useEffect, useRef, useState } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { useAuthStore } from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface Notification {
  roomId: number; // 알림이 온 채팅방의 id
  message: string; // 알림 메시지
}

export default function NotificationSse() {
  const { user, accessToken } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!user?.userId) {
      return; // 로그인 안 한 상태면 return
    }

    // SSE 연결
    const eventSource = new EventSourcePolyfill(
      `${API_URL}/api/sse/subscribe/${user.userId}`,

      // jwt 인증 추가 시 주석 해제
      {
        // headers: {
        //   Authorization: `Bearer ${accessToken}`, // JWT 토큰 헤더
        // },
        heartbeatTimeout: 120000, // 서버와의 연결 유지 간격 2분
        // withCredentials: true, // (필요 시 주석 해제)
      }
    );

    eventSourceRef.current = eventSource;

    eventSource.addEventListener("connect", (event: any) => {
      // any 부분 타입 변경 필요?
      console.log("SSE 연결 성공:", event.data);
    });

    eventSource.addEventListener("chat-notification", (event: any) => {
      const data: Notification = JSON.parse(event.data);
      console.log("채팅 알림 수신:", data);
      setNotifications((prev) => [...prev, data]);
    });

    eventSource.onerror = (err) => {
      console.error("SSE 연결 오류:", err);
      eventSource.close();
    };

    return () => {
      console.log("SSE 연결 해제");
      eventSource.close();
    };
  }, [user?.userId]);

  return (
    <div>
      <h2>알림 목록</h2>
      {notifications.map((n, i) => (
        <p key={i}>
          [{n.roomId}] {n.message}
        </p>
      ))}
    </div>
  );
}
