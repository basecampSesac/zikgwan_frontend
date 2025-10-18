import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useChatSocket } from "./useChatSocket";
import axiosInstance from "../../lib/axiosInstance";
import { IoCopyOutline, IoReturnDownBackOutline } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";

interface ChatMessage {
  nickname: string;
  message: string;
  sentAt: string;
}

interface ChatRoomProps {
  roomId: number;
  nickname: string;
  search?: string;
}

const ChatRoom = forwardRef(function ChatRoom(
  { roomId, nickname, search }: ChatRoomProps,
  ref
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    },
  }));

  const { sendMessage } = useChatSocket(
    roomId,
    nickname,
    (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    }
  );

  // 과거 채팅 불러오기
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(`/api/chatroom/chat/${roomId}`);
        if (res.data.status === "success") {
          setMessages(res.data.data);
        }
      } catch (err) {
        console.error("❌ 과거 채팅 불러오기 실패:", err);
      }
    };
    fetchMessages();
  }, [roomId]);

  // 스크롤 유지
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const messageToSend = replyTarget
      ? `${replyTarget.nickname}: ${replyTarget.message}\n${input}`
      : input;
    sendMessage(messageToSend);
    setInput("");
    setReplyTarget(null);
  };

  // 이모지 선택
  const handleEmojiClick = (emojiData: any) => {
    setInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // 복사 기능
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 날짜 구분선
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredMessages = search
    ? messages.filter((m) =>
        m.message.toLowerCase().includes(search.toLowerCase())
      )
    : messages;

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 relative">
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400 text-sm">
            {search ? "검색 결과가 없습니다." : "아직 대화가 없습니다."}
          </div>
        ) : (
          filteredMessages.map((m, i) => {
            const isMine = m.nickname === nickname;
            const prev = filteredMessages[i - 1];
            const currentDate = formatDate(m.sentAt);
            const prevDate = prev ? formatDate(prev.sentAt) : null;
            const isNewDay = currentDate !== prevDate;

            return (
              <div key={i}>
                {isNewDay && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-400 bg-white border px-3 py-1 rounded-full">
                      {currentDate}
                    </span>
                  </div>
                )}

                <div
                  className={`relative group flex flex-col ${
                    isMine ? "items-end" : "items-start"
                  }`}
                >
                  <div className="min-w-[80px] max-w-[70%] px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-[14px] text-gray-700">
                        {m.nickname}
                      </p>

                      {/* hover 툴바 */}
                      <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-2 ml-3">
                        <button
                          onClick={() => handleCopy(m.message)}
                          title="복사"
                          className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                          <IoCopyOutline size={12} />
                        </button>
                        <button
                          onClick={() => setReplyTarget(m)}
                          title="인용"
                          className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                          <IoReturnDownBackOutline size={13} />
                        </button>
                      </div>
                    </div>

                    {/* 메시지 내용 */}
                    <div className="text-[14px] whitespace-pre-wrap break-words text-gray-800 mt-1">
                      {m.message.includes("\n") ? (
                        <>
                          {/* 인용된 블록 */}
                          <div className="border-[#6F00B6]/70 bg-[#F8F5FF] px-3 py-1.5 mb-1 rounded-md text-[13px] text-gray-700">
                            <p className="font-semibold text-[#6F00B6] mb-0.5">
                              {m.message.split("\n")[0].split(":")[0]}
                            </p>
                            <p className="text-gray-600 pr-7">
                              {m.message
                                .split("\n")[0]
                                .split(":")
                                .slice(1)
                                .join(":")}
                            </p>
                          </div>

                          {/* 실제 내 메시지 */}
                          <p>{m.message.split("\n").slice(1).join("\n")}</p>
                        </>
                      ) : (
                        <p>{m.message}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-1 px-1">
                    {new Date(m.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="p-4 border-t border-gray-200 bg-white flex flex-col gap-2 relative">
        {/* 인용 미리보기 */}
        <div
          className={`transition-all duration-300 ease-in-out transform origin-bottom ${
            replyTarget
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0 pointer-events-none"
          }`}
        >
          {replyTarget && (
            <div className="bg-white/95 border border-gray-200 px-3 py-2 mb-2 rounded-md flex justify-between items-center text-sm text-gray-700 backdrop-blur-sm">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-700 truncate">
                  ↩ {replyTarget.nickname}
                </p>
                <p className="text-gray-500 text-[13px] truncate">
                  {replyTarget.message
                    .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
                    .slice(0, 60)}
                  {replyTarget.message.length > 60 ? "..." : ""}
                </p>
              </div>
              <button
                onClick={() => setReplyTarget(null)}
                className="ml-3 text-gray-400 hover:text-gray-600 text-[13px]"
                title="인용 취소"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-2xl hover:scale-110 transition"
            title="이모지 선택"
          >
            😊
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === "Enter") {
                e.preventDefault();
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

        {/* 이모지 리스트 */}
        {showEmojiPicker && (
          <div className="absolute bottom-[64px] left-4 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatRoom;
