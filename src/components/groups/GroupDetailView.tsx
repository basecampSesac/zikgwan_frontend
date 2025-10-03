import type { GroupUI } from "../../types/group";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance";
import ShareButton from "../common/ShareButton";
import { useToastStore } from "../../store/toastStore";
import ConfirmModal from "../../Modals/ConfirmModal";
import GroupForm from "./GroupForm";
import Modal from "../Modal";

import {
  FiCalendar,
  FiUser,
  FiMapPin,
  FiArrowLeft,
  FiTrash2,
  FiEdit3,
} from "react-icons/fi";
import { useState } from "react";

interface Props {
  group: GroupUI;
}

export default function GroupDetailView({ group }: Props) {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 참여하기
  const handleJoinGroup = async () => {
    try {
      const res = await axiosInstance.post(`/api/group/${group.id}/join`);
      if (res.data.status === "success") {
        addToast("모임에 참여했습니다 ✅", "success");
      } else {
        addToast(res.data.message || "참여 실패 ❌", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("참여 중 오류가 발생했습니다.", "error");
    }
  };

  // 모임 삭제
  const handleDeleteGroup = async () => {
    try {
      const res = await axiosInstance.delete(`/api/group/${group.id}`);
      if (res.data.success) {
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

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="relative w-full max-w-3xl">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate("/groups")}
          className="absolute -left-55 top-0 flex items-center gap-3 text-1xl font-bold text-gray-700 hover:text-[#6F00B6] transition"
        >
          <FiArrowLeft size={28} />
          모임 목록으로 돌아가기
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-10">
          {/* 상단 버튼 라인 */}
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
            onClick={handleJoinGroup}
            className="w-full py-4 rounded-lg font-semibold text-lg transition mb-8 bg-[#6F00B6] text-white hover:bg-[#8A2BE2]"
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

      {/* 삭제 확인 모달 */}
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
    </main>
  );
}
