import { useParams } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import { useState, useEffect } from "react";
import ChatRoom from "../components/chat/ChatRoom";

export default function GroupChatPage() {
  const { id } = useParams<{ id: string }>();
  const [roomId, setRoomId] = useState<number | null>(null);
  const nickname = localStorage.getItem("nickname") || "익명";

  useEffect(() => {
    const createRoom = async () => {
      try {
        const res = await axiosInstance.post(
          `/api/chatroom/community/${id}?roomName=모임채팅방`
        );
        if (res.data.status === "success") {
          setRoomId(res.data.data.roomId);
        }
      } catch (err) {
        console.error("채팅방 생성 실패:", err);
      }
    };

    createRoom();
  }, [id]);

  if (!roomId) return <div>채팅방을 생성 중...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">모임 채팅방</h2>
      <ChatRoom roomId={roomId} nickname={nickname} />
    </div>
  );
}
