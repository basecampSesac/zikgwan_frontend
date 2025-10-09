import { useCallback, useEffect, useState } from "react";
import { useChatSocket } from "./useChatSocket";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../../lib/axiosInstance";

interface ChatMessage {
  nickname: string;
  message: string;
  sentAt: string;
}

interface ChatRoomProps {
  roomId: number;
  nickname: string;
}

export default function ChatRoom({ roomId, nickname }: ChatRoomProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  // 과거 채팅 불러오기
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/chatroom/chat/${roomId}/${user?.userId}`
        );
        if (res.data.status === "success") {
          setMessages(res.data.data);
        }
      } catch (err) {
        console.error("과거 채팅 불러오기 실패:", err);
      }
    };
    if (roomId && user?.userId) fetchMessages();
  }, [roomId, user?.userId]);

  // ✅ 메시지 핸들러 (useCallback으로 고정 → 의존성 문제 해결)
  const handleMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  // 소켓 연결
  const { sendMessage } = useChatSocket(roomId, nickname, handleMessage);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md">
      {/* 메시지 리스트 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg text-sm ${
              m.nickname === nickname
                ? "bg-purple-100 text-right"
                : "bg-gray-100 text-left"
            }`}
          >
            <p className="font-semibold text-xs text-gray-500">
              {m.nickname} • {new Date(m.sentAt).toLocaleTimeString()}
            </p>
            <p>{m.message}</p>
          </div>
        ))}
      </div>

      {/* 입력창 */}
      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border rounded-md px-3 py-2 text-sm"
          placeholder="메시지를 입력하세요..."
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-[#6F00B6] text-white rounded-md"
        >
          전송
        </button>
      </div>
    </div>
  );
}