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
}

export default function ChatListPanel({
  onSelect,
}: {
  onSelect: (roomId: number, title: string) => void;
}) {
  const [rooms, setRooms] = useState<ChatListItem[]>([]);
  const { user } = useAuthStore();
  const { setLeaderNickname } = useChatWidgetStore();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axiosInstance.get("/api/chatroom/all");
        if (res.data.status === "success" && Array.isArray(res.data.data)) {
          const fetchedRooms: ChatListItem[] = res.data.data;
          setRooms(fetchedRooms);

          for (const room of fetchedRooms) {
            if (!room.communityId) continue;
            try {
              const { data } = await axiosInstance.get(
                `/api/chatroom/community/${room.communityId}`
              );
              if (data.status === "success" && data.data?.leaderNickname) {
                setLeaderNickname(room.roomId, data.data.leaderNickname);
              }
            } catch (err) {
              console.warn(`🚨 방 ${room.roomId} leader 조회 실패`, err);
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

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-gray-100 bg-white/90 backdrop-blur-sm flex items-center justify-between">
        <span className="text-[15px] font-semibold text-gray-800">
          내 채팅방
        </span>
        <span className="text-sm text-gray-400">
          {rooms.length > 0 ? `${rooms.length}개` : ""}
        </span>
      </div>

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto bg-white">
        {rooms.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            참여 중인 채팅방이 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {rooms.map((room) => (
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
