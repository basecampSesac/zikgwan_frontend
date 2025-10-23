import { useChatWidgetStore } from "../../store/chatWidgetStore";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axiosInstance";
import ChatListItemRow from "./ChatListItemRow";

interface ChatListItem {
  roomId: number;
  roomName: string;
  lastMessage: string;
  unreadCount: number;
  communityId: number;
  lastMessageTime?: string | null;
  type?: "C" | "T"; // 수정: RoomType 구분 필드 추가
}

// 수정: 탭 타입 정의
type TabType = "TICKET" | "COMMUNITY";

export default function ChatListPanel({
  onSelect,
}: {
  onSelect: (roomId: number, title: string) => void;
}) {
  const [rooms, setRooms] = useState<ChatListItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("TICKET"); // 수정: 현재 선택된 탭 상태 추가
  const { user } = useAuthStore();
  const { setLeaderNickname } = useChatWidgetStore();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axiosInstance.get("/api/chatroom/all");
        if (res.data.status === "success" && Array.isArray(res.data.data)) {
          const fetchedRooms: ChatListItem[] = res.data.data;

          // 각 방의 최신 메시지 sentAt 가져오기
          const withLastMessageTime = await Promise.all(
            fetchedRooms.map(async (room) => {
              try {
                const chatRes = await axiosInstance.get(
                  `/api/chatroom/chat/${room.roomId}`
                );
                const messages = chatRes.data.data;
                const last = messages?.[messages.length - 1];
                return {
                  ...room,
                  lastMessageTime: last?.sentAt || null,
                  lastMessage: last?.message || room.lastMessage || "",
                };
              } catch {
                return { ...room, lastMessageTime: null };
              }
            })
          );

          // 최신순 정렬 (sentAt 없으면 뒤로)
          withLastMessageTime.sort((a, b) => {
            const aTime = a.lastMessageTime
              ? new Date(a.lastMessageTime).getTime()
              : 0;
            const bTime = b.lastMessageTime
              ? new Date(b.lastMessageTime).getTime()
              : 0;
            return bTime - aTime;
          });

          setRooms(withLastMessageTime);

          // leaderNickname 미리 저장
          for (const room of withLastMessageTime) {
            if (!room.communityId) continue;
            try {
              const { data } = await axiosInstance.get(
                `/api/chatroom/community/${room.communityId}`
              );
              if (data.status === "success" && data.data?.leaderNickname) {
                setLeaderNickname(room.roomId, data.data.leaderNickname);
              }
            } catch (err) {
              console.warn(`방 ${room.roomId} leader 조회 실패`, err);
            }
          }
        }
      } catch (err) {
        console.warn("채팅방 목록 불러오기 실패:", err);
      }
    };
    fetchRooms();
  }, [user?.nickname, setLeaderNickname]);

  const handleLeaveSuccess = (roomId: number) => {
    setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
  };

  // 수정: 탭별 필터링 처리
  const filteredRooms = rooms.filter((room) => {
    if (activeTab === "TICKET") return room.type === "T";
    if (activeTab === "COMMUNITY") return room.type === "C";
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
      {/* 헤더 + 탭 영역 */}
      <div className="border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="text-[15px] font-semibold text-gray-800">
            내 채팅방
          </span>
          <span className="text-sm text-gray-400">
            {rooms.length > 0 ? `${rooms.length}개` : ""}
          </span>
        </div>

        {/* 수정: 탭 버튼 추가 */}
        <div className="flex border-t border-gray-100">
          <button
            onClick={() => setActiveTab("TICKET")}
            className={`flex-1 py-2.5 text-sm font-semibold transition ${
              activeTab === "TICKET"
                ? "text-[#6F00B6] border-b-2 border-[#6F00B6] bg-white"
                : "text-gray-500 hover:text-gray-700 bg-gray-50"
            }`}
          >
            티켓 채팅방
          </button>
          <button
            onClick={() => setActiveTab("COMMUNITY")}
            className={`flex-1 py-2.5 text-sm font-semibold transition ${
              activeTab === "COMMUNITY"
                ? "text-[#6F00B6] border-b-2 border-[#6F00B6] bg-white"
                : "text-gray-500 hover:text-gray-700 bg-gray-50"
            }`}
          >
            모임 채팅방
          </button>
        </div>
      </div>

      {/* 리스트 영역 */}
      <div className="flex-1 overflow-y-auto bg-white">
        {filteredRooms.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            참여 중인 {activeTab === "TICKET" ? "티켓" : "모임"} 채팅방이
            없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredRooms.map((room) => (
              <li key={room.roomId}>
                <ChatListItemRow
                  room={room}
                  onSelect={onSelect}
                  onLeaveSuccess={() => handleLeaveSuccess(room.roomId)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
