import { useState } from "react";
import type { TicketUI } from "../../types/ticket";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance";
import ShareButton from "../common/ShareButton";
import { useToastStore } from "../../store/toastStore";
import ConfirmModal from "../../Modals/ConfirmModal";
import Modal from "../Modal";
import TicketForm from "./TicketForm";
import {
  FiCalendar,
  FiMapPin,
  FiEdit3,
  FiTrash2,
  FiCreditCard,
} from "react-icons/fi";
import { HiOutlineUsers } from "react-icons/hi";

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
    <main className="bg-white flex items-center justify-center py-10 px-4">
      <div className="relative w-full max-w-7xl">
        <div className="bg-white rounded-2xl p-10 border border-gray-200">
          {/* 메인 콘텐츠 영역 */}
          <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-10">
            {/* 이미지 영역 */}
            <div className="flex flex-col relative">
              <div className="relative w-full h-[450px] bg-gray-100 flex items-center justify-center rounded-2xl overflow-hidden border border-gray-100">
                <span
                  className={`absolute top-3 left-3 px-3 py-1.5 text-sm font-semibold rounded-md text-white ${
                    ticket.status === "판매중" ? "bg-[#6F00B6]" : "bg-gray-400"
                  }`}
                >
                  {ticket.status}
                </span>

                {ticket.imageUrl ? (
                  <img
                    src={ticket.imageUrl}
                    alt="티켓 이미지"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500">티켓 이미지 없음</span>
                )}
              </div>
            </div>

            {/* 오른쪽 정보 영역 */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mt-5 mb-6 text-gray-900 tracking-tight">
                  {ticket.title}
                </h2>

                <div className="text-gray-700 mb-4 divide-y divide-gray-100">
                  {[
                    {
                      icon: <FiCalendar className="text-gray-500" size={22} />,
                      text: new Date(ticket.gameDate).toLocaleString(),
                    },
                    {
                      icon: <FiMapPin className="text-gray-500" size={22} />,
                      text: ticket.stadiumName,
                    },
                    {
                      icon: (
                        <HiOutlineUsers className="text-gray-500" size={22} />
                      ),
                      text: `판매자: ${ticket.seller.nickname}`,
                    },
                    {
                      icon: (
                        <FiCreditCard className="text-gray-500" size={22} />
                      ),
                      text: `가격: ${ticket.price.toLocaleString()}원 (${
                        ticket.ticketCount
                      }매)`,
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

                {/* 채팅 버튼 */}
                <div className="mb-8">
                  <button
                    onClick={
                      ticket.status === "판매중" ? handleChatStart : undefined
                    }
                    disabled={ticket.status === "판매완료"}
                    className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition ${
                      ticket.status === "판매중"
                        ? "bg-gradient-to-r from-[#8A2BE2] to-[#6F00B6] text-white hover:opacity-90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    판매자와 채팅 시작하기
                  </button>
                </div>

                {/* 버튼 묶음 */}
                <div className="flex items-center justify-end gap-3 mt-8">
                  <ShareButton />
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#6F00B6] transition"
                  >
                    <FiEdit3 size={16} /> 수정
                  </button>
                  <button
                    onClick={() => setIsDeleteOpen(true)}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition"
                  >
                    <FiTrash2 size={16} /> 삭제
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 상세 설명 + 사이드 정보 */}
          <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-8 items-stretch">
            <div className="bg-gray-50 rounded-xl p-6 min-h-[370px] flex flex-col overflow-y-auto border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                티켓 상세 설명
              </h3>
              <p className="text-[17px] md:text-lg text-gray-800 leading-[1.9] whitespace-pre-line flex-1">
                {ticket.description || "판매자가 작성한 상세 설명이 없습니다."}
              </p>
            </div>

            {/* 오른쪽: 안내 카드 + 거래자 목록 */}
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-3 text-lg">
                  💁 판매자 정보
                </h4>

                <div className="flex items-center gap-4 mt-8 mb-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8A2BE2] to-[#6F00B6] flex items-center justify-center text-white text-xl font-bold shadow-sm flex-shrink-0">
                    {ticket.seller.nickname.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col justify-center leading-tight">
                    <p className="text-[15px] font-semibold text-gray-900">
                      {ticket.seller.nickname}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-[2px]">
                      ⭐ {(ticket.seller.rate ?? 0).toFixed(1)} / 5.0
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
