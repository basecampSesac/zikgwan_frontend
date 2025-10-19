import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useChatWidgetStore } from "../../store/chatWidgetStore";
import axiosInstance from "../../lib/axiosInstance";

interface ChatListItem {
  roomId: number;
  roomName: string;
  lastMessage: string;
  unreadCount: number;
}

interface Props {
  room: ChatListItem;
  onSelect: (roomId: number, title: string) => void;
  onLeaveSuccess: () => void;
}

export default function ChatListItemRow({
  room,
  onSelect,
  onLeaveSuccess,
}: Props) {
  const { user } = useAuthStore();
  const { openedRooms, setLeaderNickname } = useChatWidgetStore();

  const [leaderNickname, setLocalLeaderNickname] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeader = async () => {
      try {
        // 이미 저장된 리더 닉네임이 있으면 바로 사용
        const existing = openedRooms[room.roomId]?.leaderNickname;
        if (existing) {
          setLocalLeaderNickname(existing);
          setIsLoading(false);
          return;
        }

        let leader: string | null = null;

        // 커뮤니티 검색
        const communityRes = await axiosInstance.get(
          `/api/communities/search?keyword=${encodeURIComponent(room.roomName)}`
        );

        if (
          communityRes.data.status === "success" &&
          Array.isArray(communityRes.data.data)
        ) {
          const matched = communityRes.data.data.find(
            (c: any) => c.title.trim() === room.roomName.trim()
          );
          if (matched) {
            leader = matched.nickname;
          }
        }

        // 티켓 검색
        if (!leader) {
          const ticketRes = await axiosInstance.get(
            `/api/tickets/all?keyword=${encodeURIComponent(room.roomName)}`
          );

          if (
            ticketRes.data.status === "success" &&
            Array.isArray(ticketRes.data.data?.content)
          ) {
            const matchedTicket = ticketRes.data.data.content.find(
              (t: any) => t.title.trim() === room.roomName.trim()
            );
            if (matchedTicket) {
              leader = matchedTicket.nickname;
            }
          }
        }

        if (leader) {
          setLeaderNickname(room.roomId, leader);
          setLocalLeaderNickname(leader);
        } else {
          console.warn(`'${room.roomName}' 방의 리더를 찾지 못했습니다.`);
        }
      } catch (err) {
        console.warn(
          `leaderNickname 검색 실패 (roomName=${room.roomName}):`,
          err
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeader();
  }, [room.roomId, room.roomName, openedRooms, setLeaderNickname]);

  const isLeader = leaderNickname !== null && user?.nickname === leaderNickname;

  const handleLeaveRoom = async () => {
    try {
      await axiosInstance.delete(`/api/chatroom/${room.roomId}/leave`);
      onLeaveSuccess();
    } catch (err) {
      console.error("채팅방 나가기 실패:", err);
    }
  };

  return (
    <div className="group relative flex items-center justify-between px-5 py-4 transition-all hover:bg-gray-50">
      <button
        onClick={() => onSelect(room.roomId, room.roomName)}
        className="flex flex-col text-left overflow-hidden flex-1"
      >
        <p className="font-medium text-gray-900 truncate">{room.roomName}</p>
        <p className="text-[13px] text-gray-500 truncate mt-0.5">
          {room.lastMessage || "최근 메시지 없음"}
        </p>
      </button>

      {!isLoading && !isLeader && (
        <button
          onClick={handleLeaveRoom}
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100
               px-3 py-1 border border-gray-300 text-gray-500 hover:bg-gray-100
               rounded-lg text-[13px] font-medium transition-all duration-200"
        >
          떠나기
        </button>
      )}
      {room.unreadCount > 0 && (
        <span className="ml-3 bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {room.unreadCount}
        </span>
      )}
    </div>
  );
}
