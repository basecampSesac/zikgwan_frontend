import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance";
import ShareButton from "../common/ShareButton";
import { useToastStore } from "../../store/toastStore";
import ConfirmModal from "../../Modals/ConfirmModal";
import GroupForm from "./GroupForm";
import Modal from "../Modal";
import ChatRoom from "../chat/ChatRoom";
import { useAuthStore } from "../../store/authStore";
import {
  FiCalendar,
  FiUser,
  FiMapPin,
  FiArrowLeft,
  FiTrash2,
  FiEdit3,
} from "react-icons/fi";
import type { GroupUI } from "../../types/group";

interface CommunityDetailResponse {
  communityId: number;
  title: string;
  description: string;
  date: string;
  memberCount: number;
  stadium: string;
  home: string;
  away: string;
  nickname: string;
  state: "ING" | "DONE";
  saveState: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  status: "success" | "error";
  message: string | null;
  data: T;
}

export default function GroupDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [nickname] = useState(user?.nickname || "");
  const { addToast } = useToastStore();
  const [group, setGroup] = useState<GroupUI | null>(null);

  // 모달 상태
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);

  // 상세 조회
  useEffect(() => {
    const fetchGroupDetail = async () => {
      try {
        const res = await axiosInstance.get<
          ApiResponse<CommunityDetailResponse>
        >(`/api/communities/${id}`);

        if (res.data.status === "success" && res.data.data) {
          const g = res.data.data;
          const mapped: GroupUI = {
            id: g.communityId,
            title: g.title,
            content: g.description,
            date: g.date,
            stadiumName: g.stadium,
            teams: `${g.home} vs ${g.away}`,
            personnel: g.memberCount,
            leader: g.nickname,
            status: g.state === "ING" ? "모집중" : "모집마감",
          };
          setGroup(mapped);
        } else {
          addToast("모임 정보를 불러오지 못했습니다.", "error");
        }
      } catch (err) {
        console.error("모임 상세 조회 실패:", err);
        addToast("서버 오류가 발생했습니다.", "error");
      }
    };

    fetchGroupDetail();
  }, [id, addToast]);

  // 삭제
  const handleDeleteGroup = async () => {
    try {
      const res = await axiosInstance.delete(`/api/group/${id}`);
      if (res.data.status === "success") {
        addToast("모임이 삭제되었습니다 ✅", "success");
        navigate("/groups");
      } else {
        addToast(res.data.message || "삭제 실패 ❌", "error");
      }
    } catch (err) {
      console.error("모임 삭제 오류:", err);
      addToast("모임 삭제 중 오류가 발생했습니다.", "error");
    } finally {
      setIsDeleteOpen(false);
    }
  };

  // 채팅방 입장
  const handleJoinChat = async () => {
    try {
      const res = await axiosInstance.patch(
        `/api/chatroom/${group?.id}/join/${user?.userId}`
      );

      if (res.data.status === "success" && res.data.data) {
        setRoomId(group!.id);
        setIsChatOpen(true);
      } else {
        addToast(res.data.message || "채팅방 입장 실패 ❌", "error");
      }
    } catch (err) {
      console.error("채팅방 입장 오류:", err);
      addToast("채팅방 입장 중 오류가 발생했습니다.", "error");
    }
  };

  // 채팅방 생성은 모임 생성 시 동시에 1번만 실행
  // const handleOpenChat = async () => {
  //   try {
  //     const res = await axiosInstance.post(
  //       `/api/chatroom/community/${id}?roomName=${encodeURIComponent(
  //         group?.title || "모임채팅방"
  //       )}`
  //     );

  //     if (res.data.status === "success" && res.data.data.roomId) {
  //       setRoomId(res.data.data.roomId);
  //       setIsChatOpen(true);
  //     } else {
  //       addToast(res.data.message || "채팅방 생성 실패 ❌", "error");
  //     }
  //   } catch (err) {
  //     console.error("채팅방 생성 오류:", err);
  //     addToast("채팅방 생성 중 오류가 발생했습니다.", "error");
  //   }
  // };

  if (!group) {
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-500">
        모임 정보를 불러오는 중입니다...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="relative w-full max-w-3xl">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate("/groups")}
          className="absolute -left-55 top-0 flex items-center gap-3 text-lg font-bold text-gray-700 hover:text-[#6F00B6] transition"
        >
          <FiArrowLeft size={28} />
          모임 목록으로 돌아가기
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-10">
          {/* 상단 버튼 */}
          <div className="flex justify-between items-center mb-6">
            <ShareButton />
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-base rounded border border-[#6F00B6] text-[#6F00B6] hover:bg-purple-50"
              >
                <FiEdit3 size={18} /> 수정
              </button>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-base rounded bg-red-600 text-white hover:bg-red-700"
              >
                <FiTrash2 size={18} /> 삭제
              </button>
            </div>
          </div>

          {/* 이미지 */}
          <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-lg mb-8">
            {group.imageUrl ? (
              <img
                src={group.imageUrl}
                alt="모임 이미지"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-gray-500">모임 이미지</span>
            )}
          </div>

          {/* 제목 */}
          <h2 className="text-3xl font-bold mb-5">{group.title}</h2>

          {/* 모임 정보 */}
          <div className="space-y-2 text-gray-600 mb-6">
            <p className="flex items-center gap-2 text-lg">
              <FiCalendar /> {group.date}
            </p>
            <p className="flex items-center gap-2 text-lg">
              <FiMapPin /> {group.stadiumName}
            </p>
            <p className="flex items-center gap-2 text-lg">
              <FiUser /> 모집 인원: {group.personnel}
            </p>
            <p className="flex items-center gap-2 text-lg">
              <FiUser /> 모임장: {group.leader}
            </p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 참여 버튼 */}
          <button
            onClick={handleJoinChat}
            className="w-full py-4 rounded-lg font-semibold text-lg transition mb-4 bg-[#8A2BE2] text-white hover:bg-[#6F00B6]"
          >
            모임 참여하기
          </button>

          {/* 상세 설명 */}
          <div className="mb-8 min-h-[150px]">
            <h3 className="text-xl font-semibold mb-3">모임 설명</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {group.content}
            </p>
          </div>
        </div>
      </div>

      {/* 삭제 모달 */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="모임 삭제"
        description="정말 이 모임을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다."
        confirmText="삭제하기"
        cancelText="취소"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteGroup}
      />

      {/* 수정 모달 */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <GroupForm
          mode="edit"
          initialValues={group}
          onClose={() => setIsEditOpen(false)}
        />
      </Modal>

      {/* 채팅 모달 */}
      <Modal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)}>
        {roomId && nickname ? (
          <div className="w-[600px] h-[700px]">
            <ChatRoom roomId={roomId} nickname={nickname} />
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500">
            채팅방을 불러오는 중...
          </div>
        )}
      </Modal>
    </main>
  );
}
