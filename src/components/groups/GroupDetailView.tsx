import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance";
import ShareButton from "../common/ShareButton";
import { useToastStore } from "../../store/toastStore";
import ConfirmModal from "../../Modals/ConfirmModal";
import GroupForm from "./GroupForm";
import Modal from "../Modal";
import ChatRoom from "../chat/ChatRoom";
import { formatDate } from "../../utils/format";
import { useAuthStore } from "../../store/authStore";
import { FiCalendar, FiMapPin, FiTrash2, FiEdit3 } from "react-icons/fi";
import { FaRegUserCircle } from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi";
import { BiBaseball } from "react-icons/bi";
import type { CommunityDetail, GroupUI, ApiResponse } from "../../types/group";
import { getDefaultStadiumImage } from "../../constants/stadiums";

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
        const res = await axiosInstance.get<ApiResponse<CommunityDetail>>(
          `/api/communities/${id}`
        );

        if (res.data.status === "success" && res.data.data) {
          const g = res.data.data;
          const mapped: GroupUI = {
            id: g.communityId,
            title: g.title,
            content: g.description,
            date: formatDate(g.date),
            stadiumName: g.stadium,
            teams: `${g.home} vs ${g.away}`,
            personnel: g.memberCount,
            leader: g.nickname,
            status: g.state === "ING" ? "모집중" : "모집마감",
            userId: g.userId ?? undefined,
            createdAt: g.createdAt,
            updatedAt: g.updatedAt,
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
  }, [id, addToast, user?.nickname]);

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

  if (!group) {
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-500">
        모임 정보를 불러오는 중입니다...
      </main>
    );
  }

  return (
    <main className="bg-white flex items-center justify-center py-10 px-4">
      <div className="relative w-full max-w-7xl">
        <div className="bg-white rounded-2xl p-10 border border-gray-200">
          {/* 메인 콘텐츠 영역 */}
          <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-10">
            {/* 이미지 영역 */}
            <div className="flex flex-col relative">
              <div className="relative w-full h-[450px] bg-gray-100 flex items-center justify-center rounded-2xl overflow-hidden border border-gray-100">
                {/* 모집 상태 배지 */}
                <span
                  className={`absolute top-3 left-3 px-3 py-1.5 text-sm font-semibold rounded-md text-white ${
                    group.status === "모집중" ? "bg-[#6F00B6]" : "bg-gray-400"
                  }`}
                >
                  {group.status}
                </span>

                {/* 이미지 표시 */}
                <img
                  src={
                    group.imageUrl
                      ? group.imageUrl
                      : getDefaultStadiumImage(group.stadiumName)
                  }
                  alt="모임 이미지"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 오른쪽 정보 영역 */}
            <div className="flex flex-col justify-between">
              <div>
                {/* 제목 */}
                <h2 className="text-3xl font-bold mt-5 mb-6 text-gray-900 tracking-tight">
                  {group.title}
                </h2>
                {/* 모임 정보 */}
                <div className="text-gray-700 mb-4 divide-y divide-gray-100">
                  {[
                    {
                      icon: <FiCalendar className="text-gray-500" size={22} />,
                      text: group.date,
                    },
                    {
                      icon: <BiBaseball className="text-gray-500" size={22} />,
                      text: group.teams,
                    },
                    {
                      icon: <FiMapPin className="text-gray-500" size={22} />,
                      text: group.stadiumName,
                    },
                    {
                      icon: (
                        <HiOutlineUsers className="text-gray-500" size={22} />
                      ),
                      text: `모집 인원: ${group.personnel}명`,
                    },
                    {
                      icon: (
                        <FaRegUserCircle className="text-gray-500" size={22} />
                      ),
                      text: `모임장: ${group.leader}`,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 py-3 transition rounded-md"
                    >
                      {item.icon}
                      <span className="text-lg">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* 모집 참여 버튼 */}
                <div className="mb-8">
                  <button
                    onClick={handleJoinChat}
                    className="w-full px-6 py-3 rounded-lg font-semibold text-lg bg-gradient-to-r from-[#8A2BE2] to-[#6F00B6] text-white hover:opacity-90 transition cursor-pointer"
                  >
                    모임 참여하기
                  </button>
                </div>

                {/* 버튼 묶음 */}
                <div className="flex items-center justify-end gap-3 mt-8">
                  {/* 공유 버튼 */}
                  <div className="cursor-pointer">
                    <ShareButton />
                  </div>

                  {/* 수정 / 삭제 버튼 */}
                  {user?.nickname && group?.leader === user.nickname && (
                    <>
                      <button
                        onClick={() => setIsEditOpen(true)}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#6F00B6] transition cursor-pointer"
                      >
                        <FiEdit3 size={16} />
                        수정
                      </button>

                      <button
                        onClick={() => setIsDeleteOpen(true)}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition cursor-pointer"
                      >
                        <FiTrash2 size={16} />
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 상세 설명 (이미지 하단 전체 너비) */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-900">모임 설명</h3>
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] max-h-[400px] overflow-y-auto">
              <p className="text-[17px] md:text-lg text-gray-800 leading-[1.9] whitespace-pre-line">
                {group.content || "모임에 대한 설명이 없습니다."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 모달 */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="모임 삭제"
        description={
          "정말 이 모임을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다."
        }
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
