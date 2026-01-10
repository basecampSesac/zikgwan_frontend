import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance";
import { useToastStore } from "../../store/toastStore";
import { useAuthStore } from "../../store/authStore";
import ConfirmModal from "../../Modals/ConfirmModal";
import Modal from "../Modal";
import TicketForm from "./TicketForm";
import ShareButton from "../common/ShareButton";
import { TICKET_TRADE_GUIDE } from "../../data/guides";
import {
  MdOutlineSportsBaseball,
  MdAirlineSeatReclineNormal,
} from "react-icons/md";
import { FiCheckCircle } from "react-icons/fi";
import {
  FiEdit3,
  FiTrash2,
  FiCalendar,
  FiMapPin,
  FiCreditCard,
} from "react-icons/fi";
import { HiOutlineUsers } from "react-icons/hi";
import { getDefaultStadiumImage } from "../../constants/stadiums";
import type { TicketUI } from "../../types/ticket";
import { useChatWidgetStore } from "../../store/chatWidgetStore";
import { formatDate } from "../../utils/format";
import CompleteTradeModal from "./CompleteTradeModal";
import UserAvatar from "../common/UserAvatar";

interface TicketDetailViewProps {
  ticket: TicketUI;
}

export default function TicketDetailView({ ticket }: TicketDetailViewProps) {
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const { user } = useAuthStore();
  const { openPopup } = useChatWidgetStore();

  const [roomId, setRoomId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // 현재 로그인 사용자가 참여 중인 채팅방 조회 (단, 판매자는 제외)
  const fetchChatRoom = useCallback(
    async (tsId: number, sellerNickname?: string) => {
      // 판매자라면 실행하지 않음
      if (user?.nickname === sellerNickname) {
        return;
      }

      try {
        const res = await axiosInstance.get(`/api/chatroom/ticket/${tsId}`);
        if (res.data?.status === "success" && res.data.data) {
          setRoomId(res.data.data.roomId);
        }
      } catch (err) {
        console.error("채팅방 조회 실패:", err);
      }
    },
    [user?.nickname]
  );

  // 티켓 정보 초기 로드 (URL에서 가져온 ID 기준)
  const loadTicketData = useCallback(async () => {
    if (!ticket?.tsId) return;

    try {
      const res = await axiosInstance.get(`/api/tickets/${ticket.tsId}`);
      if (res.data?.status === "success" && res.data.data) {
        const t = res.data.data;

        

        // 상태 업데이트
        // (이 로직은 부모 컴포넌트에서 처리하므로 여기서는 안 함)

        // 채팅방 정보 조회
        fetchChatRoom(t.tsId, t.nickname);
      } else {
        addToast("티켓 정보를 불러오지 못했습니다.", "error");
      }
    } catch (err) {
      console.error("티켓 상세 조회 실패:", err);
      addToast("서버 오류가 발생했습니다.", "error");
    }
  }, [ticket?.tsId, addToast, fetchChatRoom]);

  // 초기 로드
  useState(() => {
    loadTicketData();
  });

  // 판매자 여부
  const isSeller = user?.nickname === ticket?.nickname;

  // 판매자와 채팅 시작 (최초 생성 → 이후 입장)
  const handleJoinTicket = async () => {
    if (!user) {
      addToast("로그인 후 이용해주세요.", "error");
      return;
    }

    if (!ticket) {
      addToast("티켓 정보가 없습니다.", "error");
      return;
    }

    if (isSeller) {
      addToast("본인이 등록한 티켓입니다.", "error");
      return;
    }

    if (ticket.state !== "ING") {
      addToast("이미 판매 완료된 티켓입니다.", "error");
      return;
    }

    try {
      const res = await axiosInstance.post(`/api/chatroom/ticket/${ticket.tsId}`, {
        ticketId: ticket.tsId,
        participantId: user?.userId || 0,
      });

      if (res.data?.status === "success") {
        setRoomId(res.data.data.roomId);
        addToast("채팅방에 입장했습니다.", "success");
        openPopup(res.data.data.roomId, `${ticket.home} vs ${ticket.away}`);
      } else {
        addToast(res.data?.message || "채팅방 입장 실패", "error");
      }
    } catch (err) {
      console.error("채팅방 입장 실패:", err);
      addToast("서버 오류가 발생했습니다.", "error");
    }
  };

  // 티켓 삭제
  const handleDeleteTicket = async () => {
    if (!ticket) return;

    try {
      const res = await axiosInstance.delete(`/api/tickets/${ticket.tsId}`);
      if (res.data?.status === "success") {
        addToast("티켓이 삭제되었습니다.", "success");
        setIsDeleteOpen(false);
        navigate("/mypage");
      } else {
        addToast(res.data?.message || "삭제 실패", "error");
      }
    } catch (err) {
      console.error("티켓 삭제 실패:", err);
      addToast("서버 오류가 발생했습니다.", "error");
    } finally {
      setIsDeleteOpen(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {ticket ? (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative">
              <img
                src={getDefaultStadiumImage(ticket.stadium)}
                alt={ticket.title}
                className="w-full h-64 object-cover"
              />

              {/* 상태 뱃지 */}
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    ticket.state === "ING"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {ticket.state === "ING" ? "판매중" : "판매 완료"}
                </span>
              </div>

              {/* 가격 정보 */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg">
                <div className="text-2xl font-bold">
                  {ticket.price.toLocaleString()}원
                </div>
                <div className="text-sm opacity-90">{ticket.ticketCount}매</div>
              </div>
            </div>

            <div className="p-6">
              {/* 제목과 설명 */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {ticket.title}
              </h1>
              {ticket.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {ticket.description}
                </p>
              )}

              {/* 상세 정보 */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MdOutlineSportsBaseball className="text-gray-400" size={20} />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {ticket.home} vs {ticket.away}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ticket.stadium}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-gray-400" size={20} />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {formatDate(ticket.gameDay)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-gray-400" size={20} />
                    <div className="text-gray-700">
                      좌석 정보: 문의 바람
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiCreditCard className="text-gray-400" size={20} />
                    <div className="font-semibold text-gray-900">
                      {ticket.price.toLocaleString()}원 ({ticket.ticketCount}매)
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MdAirlineSeatReclineNormal
                      className="text-gray-400"
                      size={20}
                    />
                    <div className="text-gray-700">
                      연석: {ticket.adjacentSeat === "Y" ? "가능" : "불가"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 판매자 정보 */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
<UserAvatar
                      nickname={user?.nickname}
                      size={48}
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {ticket.nickname}
                      </div>
                      {ticket.rating && (
                        <div className="flex items-center gap-1">
                          <FiCheckCircle
                            className="text-yellow-400"
                            size={16}
                          />
                          <span className="text-sm text-gray-600">
                            평점 {ticket.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <ShareButton />
                </div>
              </div>

              {/* 버튼 그룹 */}
              <div className="flex flex-wrap gap-3">
                {user ? (
                  <>
                    {/* 채팅 버튼 */}
                    {ticket.state === "ING" && !isSeller && ticket.tsId && user && (
                      <button
                        onClick={handleJoinTicket}
                        className="flex-1 bg-[#6F00B6] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5a0094] transition flex items-center justify-center gap-2"
                      >
                        <HiOutlineUsers size={20} />
                        채팅 시작하기
                      </button>
                    )}

                    {/* 채팅방 입장 버튼 */}
                    {roomId && !isSeller && user && (
                      <button
                        onClick={() => openPopup(roomId, `${ticket.home} vs ${ticket.away}`)}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <HiOutlineUsers size={20} />
                        채팅방 입장
                      </button>
                    )}

                    {/* 판매자 버튼 */}
                    {isSeller && (
                      <>
                        <button
                          onClick={() => setIsEditOpen(true)}
                          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                          <FiEdit3 size={20} />
                          수정하기
                        </button>

                        {ticket.state === "ING" && (
                          <button
                            onClick={() => setIsCompleteModalOpen(true)}
                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                          >
                            <FiCheckCircle size={20} />
                            거래 완료
                          </button>
                        )}

                        <button
                          onClick={() => setIsDeleteOpen(true)}
                          className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                        >
                          <FiTrash2 size={20} />
                          삭제하기
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                    >
                      로그인 후 이용 가능
                    </button>
                  </>
                )}

                {/* 가이드 버튼 */}
                <button
                  onClick={() => window.open(TICKET_TRADE_GUIDE, "_blank", "noopener,noreferrer")}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  거래 가이드
                </button>
              </div>
            </div>
          </div>

          {/* 편집 모달 */}
          <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
            <TicketForm
              mode="edit"
              initialValues={ticket}
              onClose={() => setIsEditOpen(false)}
              onSuccess={() => {
                setIsEditOpen(false);
                // TODO: 데이터 새로고침
              }}
            />
          </Modal>

          {/* 삭제 확인 모달 */}
          <ConfirmModal
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleDeleteTicket}
            title="티켓 삭제"
            description="정말로 이 티켓을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
            confirmText="삭제"
            cancelText="취소"
          />

          {/* 거래 완료 모달 */}
          <CompleteTradeModal
            isOpen={isCompleteModalOpen}
            onClose={() => setIsCompleteModalOpen(false)}
            tsId={ticket.tsId}
            onSuccess={() => {
              setIsCompleteModalOpen(false);
              // TODO: 데이터 새로고침
            }}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            티켓 정보를 찾을 수 없습니다.
          </div>
          <button
            onClick={() => navigate("/tickets")}
            className="text-[#6F00B6] hover:text-[#5a0094] font-medium"
          >
            목록으로 돌아가기
          </button>
        </div>
      )}
    </main>
  );
}