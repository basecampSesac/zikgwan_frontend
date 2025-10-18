import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axiosInstance";

interface ChatListItem {
  roomId: number;
  roomName: string;
  lastMessage: string;
  unreadCount: number;
}

interface Props {
  onSelect: (roomId: number, title: string) => void;
}

export default function ChatListPanel({ onSelect }: Props) {
  const [rooms, setRooms] = useState<ChatListItem[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axiosInstance.get("/api/chatroom/all");
        if (res.data.status === "success" && Array.isArray(res.data.data)) {
          setRooms(res.data.data);
        } else {
          console.warn("채팅방 목록 형식이 올바르지 않습니다:", res.data);
          setRooms([]);
        }
      } catch (err) {
        console.warn("채팅방 목록 불러오기 실패:", err);
        setRooms([]);
      }
    };
    fetchRooms();
  }, []);

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
                <button
                  onClick={() => onSelect(room.roomId, room.roomName)}
                  className="w-full flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col text-left overflow-hidden">
                    <p className="font-medium text-gray-900 truncate">
                      {room.roomName}
                    </p>
                    <p className="text-[13px] text-gray-500 truncate mt-0.5">
                      {room.lastMessage || "최근 메시지 없음"}
                    </p>
                  </div>
                  {room.unreadCount > 0 && (
                    <span className="ml-3 bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {room.unreadCount}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
