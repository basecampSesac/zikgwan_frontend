import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { IoSearchOutline, IoClose, IoPeopleOutline } from "react-icons/io5";
import ChatRoom from "./ChatRoom";
import { useChatWidgetStore } from "../../store/chatWidgetStore";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../../lib/axiosInstance";

export default function ChatPopup({
  roomId,
  offsetX = 0,
  title,
  initialMemberCount,
}: {
  roomId: number;
  offsetX?: number;
  title: string;
  initialMemberCount?: number;
}) {
  const { closePopup } = useChatWidgetStore();
  const { user } = useAuthStore();

  const nodeRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<{ scrollToBottom: () => void }>(null);

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [memberCount, setMemberCount] = useState<number | null>(
    initialMemberCount ?? null
  );

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 상세 정보 불러오기
  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        const res = await axiosInstance.get(`/api/chatroom/detail/${roomId}`);
        if (res.data.status === "success" && res.data.data) {
          const { userCount } = res.data.data;
          setMemberCount(userCount ?? null);
        }
      } catch (err) {
        console.error("🚨 채팅방 상세정보 불러오기 실패:", err);
      }
    };

    fetchRoomDetail();
  }, [roomId]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        closePopup(roomId);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [roomId, closePopup]);

  // 채팅방 입장 (join)
  useEffect(() => {
    const joinRoom = async () => {
      try {
        await axiosInstance.patch(`/api/chatroom/${roomId}/join`);
      } catch (err) {
        console.warn("채팅방 join 실패:", err);
      }
    };
    joinRoom();

    return () => {
      axiosInstance.patch(`/api/chatroom/exit`).catch(() => {});
    };
  }, [roomId]);

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearch("");
    chatRef.current?.scrollToBottom();
    setTimeout(() => chatRef.current?.scrollToBottom(), 100);
  };

  return (
    <Draggable
      nodeRef={nodeRef as unknown as React.RefObject<HTMLElement>}
      handle=".drag-handle"
      bounds="parent"
      disabled={isMobile}
    >
      <div
        ref={nodeRef}
        className="
          fixed bg-white z-[2000] overflow-hidden border border-gray-300 shadow-lg

          /* 모바일: 풀스크린 */
          inset-0 w-full h-[100dvh] rounded-none

          /* 데스크탑: 기존 팝업 */
          md:inset-auto md:w-[440px] md:h-[640px] md:rounded-2xl
        "
        style={
          isMobile
            ? undefined
            : {
                top: `calc(50% - 320px)`,
                left: `calc(50% - 220px + ${offsetX * 40}px)`,
              }
        }
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div
            className="
              drag-handle cursor-move flex justify-between items-center
              px-4 py-3 bg-gray-100 text-gray-700 border-b border-gray-200
              select-none active:cursor-grabbing
              md:rounded-t-2xl
            "
          >
            <span className="inline-flex items-center gap-2 font-semibold text-[15px] max-w-[300px] sm:max-w-[200px] md:max-w-[300px] truncate">
              💬{" "}
              {title
                ? title.length > (isMobile ? 12 : 19)
                  ? title.slice(0, isMobile ? 12 : 19) + "..."
                  : title
                : `모임 채팅 #${roomId}`}
              {/* 인원 표시 */}
              {memberCount !== null && (
                <span className="inline-flex items-center text-gray-500 text-sm font-normal ml-2">
                  <IoPeopleOutline size={16} className="mr-1" />
                  {memberCount}명
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              {/* 검색 버튼 */}
              <button
                onClick={() => setShowSearch((prev) => !prev)}
                className="text-gray-500 hover:text-[#6F00B6] transition"
                title="검색"
              >
                <IoSearchOutline size={22} className="sm:size-[20px]" />
              </button>

              {/* 닫기 버튼 */}
              <button
                onClick={() => closePopup(roomId)}
                className="p-1 text-gray-500 hover:bg-gray-200 rounded-md transition"
              >
                <IoClose size={22} className="sm:size-[20px]" />
              </button>
            </div>
          </div>

          {/* 본문 */}
          <div className="relative flex-1 bg-gray-50 overflow-hidden">
            <ChatRoom
              ref={chatRef}
              roomId={roomId}
              nickname={user?.nickname || "익명"}
              search={search}
            />

            {/* 검색 패널 */}
            <div
              className={`
                absolute top-0 left-0 w-full bg-white/95 border-b border-gray-200 backdrop-blur-md z-50
                transition-transform duration-300 ease-in-out
                ${showSearch ? "translate-y-0" : "-translate-y-full"}
              `}
            >
              <div className="flex items-center px-4 py-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="메시지 검색..."
                  autoFocus={showSearch}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6F00B6]/40 bg-white"
                />
                <button
                  onClick={handleCloseSearch}
                  className="ml-2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
