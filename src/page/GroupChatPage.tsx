import { useParams } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import { useState, useEffect } from "react";
import ChatRoom from "../components/chat/ChatRoom";

export default function GroupChatPage() {
  const { id } = useParams<{ id: string }>();
  const [roomId, setRoomId] = useState<number | null>(null);
  const nickname = localStorage.getItem("nickname") || "익명";

  useEffect(() => {
    // 채팅방 조회
    const getChatRoom = async () => {
      try {
        const res = await axiosInstance.get(`/api/chatroom/community/${id}`);

        if (res.data.status === "success") {
          setRoomId(res.data.roomId);
        }
      } catch (error) {
        console.error("채팅방 조회 실패:", error);
      }
    };

    getChatRoom();
  }, [id]);

  if (!roomId) return <div>채팅방을 생성 중...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">모임 채팅방</h2>
      <ChatRoom roomId={roomId} nickname={nickname} />
    </div>
  );
}
