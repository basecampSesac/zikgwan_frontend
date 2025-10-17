import { useCallback, useEffect, useRef, useState } from "react";
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 과거 채팅 불러오기 (userId 제거)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(`/api/chatroom/chat/${roomId}`);
        if (res.data.status === "success") {
          setMessages(res.data.data);
        } else {
          console.warn("채팅 내역 응답 이상:", res.data);
        }
      } catch (err: any) {
        console.error("❌ 과거 채팅 불러오기 실패:", err.response?.data || err);
      }
    };

    if (roomId) fetchMessages();
  }, [roomId]);

  // 소켓 연결 (roomId별 독립)
  const handleMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const { sendMessage } = useChatSocket(roomId, nickname, handleMessage);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-50">
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400 text-sm">
            아직 대화가 없습니다.
          </div>
        ) : (
          messages.map((m, i) => {
            const isMine = m.nickname === nickname;
            return (
              <div
                key={i}
                className={`flex flex-col ${
                  isMine ? "items-end" : "items-start"
                }`}
              >
                <div className="min-w-[80px] max-w-[70%] px-4 py-2.5 rounded-xl bg-white border border-gray-200">
                  <p className="font-semibold text-[14px] mb-1 text-gray-700">
                    {m.nickname}
                  </p>
                  <p className="whitespace-pre-wrap break-words text-gray-800">
                    {m.message}
                  </p>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 px-1">
                  {new Date(m.sentAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div ref={messagesEndRef} />
              </div>
            );
          })
        )}
      </div>

      {/* 입력창 */}
      <div className="p-4 border-t border-gray-200 bg-white flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return; // 한글 조합 중이면 return
            if (e.key === "Enter") {
              e.preventDefault(); // 기본 개행 방지
              handleSend();
            }
          }}
          placeholder="메시지를 입력해주세요."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6F00B6]/40"
        />
        <button
          onClick={handleSend}
          className="px-5 py-2 bg-[#6F00B6] hover:bg-[#8A2BE2] text-white text-[14px] font-medium rounded-lg transition"
        >
          전송
        </button>
      </div>
    </div>
  );
}
