import { useParams } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import { useState, useEffect } from "react";
import ChatRoom from "../components/chat/ChatRoom";

export default function TicketChatPage() {
  const { id } = useParams<{ id: string }>();
  const [roomId, setRoomId] = useState<number | null>(null);
  const nickname = localStorage.getItem("nickname") || "익명";

  useEffect(() => {
    const getChatRoom = async () => {
      try {
        const res = await axiosInstance.get(`/api/chatroom/ticket/${id}`);
        if (res.data.status === "success" && res.data.data) {
          setRoomId(res.data.data.roomId);
        } else {
          console.warn("티켓 채팅방 정보를 불러오지 못했습니다.");
        }
      } catch (err) {
        console.error("티켓 채팅방 조회 실패:", err);
      }
    };

    getChatRoom();
  }, [id]);

  if (!roomId) return <div>채팅방을 불러오는 중...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">티켓 거래 채팅방</h2>
      <ChatRoom roomId={roomId} nickname={nickname} />
    </div>
  );
}
