import { useState } from "react";
import type { TicketUI } from "../../types/ticket";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance";
import ShareButton from "../common/ShareButton";
import { useToastStore } from "../../store/toastStore";
import ConfirmModal from "../../Modals/ConfirmModal";
import Modal from "../Modal"; // ✅ 공용 모달
import TicketForm from "./TicketForm";
import {
  FiCalendar,
  FiMapPin,
  FiUser,
  FiEdit3,
  FiTrash2,
  FiArrowLeft,
} from "react-icons/fi";

interface Props {
  ticket: TicketUI;
}

export default function TicketDetailView({ ticket }: Props) {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 채팅 시작
  const handleChatStart = async () => {
    try {
      const res = await axiosInstance.post(
        `/api/chatroom/ticket?roomName=${ticket.title}`
      );
      if (res.data.status === "success") {
        const roomId = res.data.data.roomId;
        navigate(`/chat/${roomId}`);
      } else {
        addToast("채팅방 생성 실패 ❌", "error");
      }
    } catch (err) {
      console.error("채팅 시작 에러:", err);
      addToast("채팅 시작 중 오류가 발생했습니다.", "error");
    }
  };

  // 티켓 삭제
  const handleDeleteTicket = async () => {
    try {
      const res = await axiosInstance.delete(`/api/ticket/${ticket.id}`);
      if (res.data.success) {
        addToast("티켓이 삭제되었습니다 ✅", "success");
        navigate("/tickets");
      } else {
        addToast(res.data.message || "삭제 실패 ❌", "error");
      }
    } catch (err) {
      console.error("티켓 삭제 오류:", err);
      addToast("티켓 삭제 중 오류가 발생했습니다.", "error");
    } finally {
      setIsDeleteOpen(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="relative w-full max-w-3xl">
        {/* 🔙 목록으로 돌아가기 */}
        <button
          onClick={() => navigate("/tickets")}
          className="absolute -left-55 top-0 flex items-center gap-3 text-1xl font-bold text-gray-700 hover:text-[#6F00B6] transition"
        >
          <FiArrowLeft size={28} />
          티켓 목록으로 돌아가기
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
            {ticket.imageUrl ? (
              <img
                src={ticket.imageUrl}
                alt="구장 이미지"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-gray-500">구장 이미지</span>
            )}
          </div>

          {/* 제목 */}
          <h2 className="text-3xl font-bold mb-5">{ticket.title}</h2>

          {/* 경기 정보 */}
          <div className="space-y-2 text-gray-600 mb-6">
            <p className="flex items-center gap-2 text-lg">
              <FiCalendar /> {ticket.gameDate}
            </p>
            <p className="flex items-center gap-2 text-lg">
              <FiUser /> {ticket.homeTeam} vs {ticket.awayTeam}
            </p>
            <p className="flex items-center gap-2 text-lg">
              <FiMapPin /> {ticket.stadiumName}
            </p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 가격 + 매수/연석 */}
          <div className="flex items-baseline gap-3 mb-8">
            <p className="text-3xl font-extrabold text-[#6F00B6]">
              {ticket.price.toLocaleString()}원
            </p>
            <span className="text-lg text-gray-600">
              {ticket.ticketCount}매 {ticket.adjacentSeat && "(연석)"}
            </span>
          </div>

          {/* 채팅 버튼 */}
          <button
            onClick={ticket.status === "판매중" ? handleChatStart : undefined}
            disabled={ticket.status === "판매완료"}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition mb-8
              ${
                ticket.status === "판매중"
                  ? "bg-[#6F00B6] text-white hover:bg-[#8A2BE2]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            판매자와 채팅 시작하기
          </button>

          {/* 상세 설명 */}
          <div className="mb-8 min-h-[150px]">
            <h3 className="text-xl font-semibold mb-3">상세 설명</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {ticket.content}
            </p>
          </div>

          {/* 판매자 정보 */}
          <div>
            <p className="text-xl font-semibold mb-3">판매자 정보</p>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gray-300" />
              <div>
                <p className="text-lg font-medium text-gray-800">
                  {ticket.seller.nickname}
                </p>
                <p className="text-sm text-gray-500">
                  ⭐ {ticket.seller.rate} / 5.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="티켓 삭제"
        description={
          "정말 이 티켓을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다."
        }
        confirmText="삭제하기"
        cancelText="취소"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteTicket}
      />

      {/* 수정 모달 */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <TicketForm
          mode="edit"
          initialValues={ticket}
          onClose={() => setIsEditOpen(false)}
        />
      </Modal>
    </main>
  );
}
