import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "../../store/authStore";

interface ChatMessage {
  nickname: string;
  message: string;
  sentAt: string;
}

export function useChatSocket(roomId: number, nickname: string) {
  const { accessToken } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!roomId || !nickname) return;

    // STOMP Client 생성
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws/chat"),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`, // 토큰 헤더 추가
      },
      reconnectDelay: 5000,
      debug: () => {}, // 콘솔로그 끄기
      onConnect: () => {
        console.log("✅ STOMP connected");

        // 메시지 구독
        client.subscribe(`/sub/chat.${roomId}`, (msg) => {
          const body: ChatMessage = JSON.parse(msg.body);
          setMessages((prev) => [...prev, body]);
        });

        // 입장 메시지
        client.publish({
          destination: `/pub/chat.enter.${roomId}`,
          body: JSON.stringify({ nickname }),
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP error", frame.headers["message"]);
      },
    });

    client.activate(); // 연결 시작
    clientRef.current = client;

    return () => {
      client.deactivate();
      console.log("🛑 STOMP disconnected");
    };
  }, [roomId, nickname, accessToken]);

  // 메시지 전송 함수
  const sendMessage = (message: string) => {
    if (!clientRef.current || !clientRef.current.connected) return;
    clientRef.current.publish({
      destination: `/pub/chat.${roomId}`,
      body: JSON.stringify({ nickname, message }),
    });
  };

  return { messages, sendMessage };
}
