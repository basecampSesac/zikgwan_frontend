import { Client } from "@stomp/stompjs";
import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { useAuthStore } from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface ChatMessage {
  nickname: string;
  message: string;
  sentAt: string;
}

export function useChatSocket(
  roomId: number,
  nickname: string,
  onMessage: (msg: ChatMessage) => void
) {
  const { accessToken } = useAuthStore();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!roomId || !nickname) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws-connect`),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        // 메시지 수신 구독
        client.subscribe(`/sub/chat.${roomId}`, (msg) => {
          const body: ChatMessage = JSON.parse(msg.body);
          onMessage(body);
        });

        // 입장 메시지 전송 (한 번만)
        client.publish({
          destination: `/pub/chat.enter.${roomId}`,
          body: JSON.stringify({ nickname }),
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [roomId, nickname, accessToken]); // onMessage는 useCallback으로 감싸놨으니 제외

  // 일반 메시지 전송
  const sendMessage = (message: string) => {
    if (!clientRef.current || !clientRef.current.connected) return;
    clientRef.current.publish({
      destination: `/pub/chat.${roomId}`,
      body: JSON.stringify({ nickname, message }),
    });
  };

  return { sendMessage };
}
