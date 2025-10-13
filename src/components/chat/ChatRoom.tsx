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
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // 메시지 핸들러
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
    <div className="flex flex-col h-[640px] max-w-lg mx-auto bg-white rounded-2xl border border-gray-300">
      {/* 헤더 */}
      <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
        <h2 className="text-[16px] font-semibold text-gray-800">
          💬 {`채팅방 #${roomId}`}
        </h2>

        {/* 메뉴 버튼 */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            ⋮
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg text-sm overflow-hidden">
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  console.log("나가기");
                  setMenuOpen(false);
                }}
              >
                나가기
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors"
                onClick={() => {
                  console.log("떠나기");
                  setMenuOpen(false);
                }}
              >
                떠나기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 메시지 리스트 */}
      <div className="flex-1 overflow-y-auto p-5 bg-gray-50 space-y-3 custom-scroll">
        {messages.length === 0 && (
          <div className="flex justify-center items-center h-full text-gray-400 text-sm">
            아직 대화가 없습니다.
          </div>
        )}

        {messages.map((m, i) => {
          const isMine = m.nickname === nickname;
          return (
            <div
              key={i}
              className={`flex flex-col ${
                isMine ? "items-end" : "items-start"
              }`}
            >
              <div className="min-w-[80px] max-w-[70%] px-4 py-2.5 rounded-xl text-[15px] leading-snug flex flex-col justify-center bg-white border border-gray-200">
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
        })}
      </div>

      {/* 입력창 */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="메시지를 입력해주세요."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6F00B6]/40"
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
