import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance";
import { useToastStore } from "../../store/toastStore";
import { useAuthStore } from "../../store/authStore";
import ConfirmModal from "../../Modals/ConfirmModal";
import Modal from "../Modal";
import TicketForm from "./TicketForm";
import ShareButton from "../common/ShareButton";
import { MdOutlineSportsBaseball } from "react-icons/md";
import {
  FiEdit3,
  FiTrash2,
  FiCalendar,
  FiMapPin,
  FiCreditCard,
  FiMessageSquare,
  FiRepeat, // ✅ 추가
} from "react-icons/fi";
import { HiOutlineUsers } from "react-icons/hi";
import { PiSeat } from "react-icons/pi";
import { getDefaultStadiumImage } from "../../constants/stadiums";
import type { TicketUI } from "../../types/ticket";
import { useChatWidgetStore } from "../../store/chatWidgetStore";

export default function TicketDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const { user } = useAuthStore();
  const { openPopup } = useChatWidgetStore();

  const [ticket, setTicket] = useState<TicketUI | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /** ✅ UTC → KST 변환 유틸 */
  const toKST = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    date.setHours(date.getHours() + 9);
    return date.toISOString();
  };

  /** 상세 조회 */
  const fetchTicket = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/api/tickets/${id}`);
      if (res.data?.status === "success" && res.data.data) {
        const t = res.data.data;

        setTicket({
          tsId: t.tsId ?? 0,
          title: t.title ?? "제목 없음",
          description: t.description ?? "",
          price: t.price ?? 0,
          gameDay: toKST(t.gameDay), // ✅ 시간 보정 적용
          ticketCount: t.ticketCount ?? 1,
          home: t.home ?? "홈팀 정보 없음",
          away: t.away ?? "원정팀 정보 없음",
          stadium: t.stadium ?? "정보 없음",
          adjacentSeat: t.adjacentSeat ?? "N",
          nickname: t.nickname ?? "익명",
          imageUrl: t.imageUrl
            ? `http://localhost:8080/images/${t.imageUrl.replace(/^\/+/, "")}`
            : getDefaultStadiumImage(t.stadium ?? ""),

          rating: t.rating ?? 0,
          state: t.state ?? "ING",
          createdAt: t.createdAt ?? "",
          updatedAt: t.updatedAt ?? "",
        });
      } else {
        addToast("티켓 정보를 불러오지 못했습니다.", "error");
      }
    } catch (err) {
      console.error("티켓 상세 조회 실패:", err);
      addToast("서버 오류가 발생했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [id, addToast]);

  // 채팅방 상세 조회
  const fetchChatRoom = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/api/chatroom/ticket/${id}`);
      if (res.data.status === "success" && res.data.data) {
        setRoomId(res.data.data.roomId);
        console.log("채팅방 정보 불러오기 성공:", res.data.data);
      } else {
        console.warn("채팅방 정보를 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error("채팅방 상세 조회 실패:", err);
    }
  }, [id]);

  // 초기 로드
  useEffect(() => {
    fetchTicket();
    fetchChatRoom();
  }, [fetchTicket, fetchChatRoom]);

  /** 삭제 */
  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`/api/tickets/${id}`);
      if (res.data?.status === "success") {
        addToast("티켓이 삭제되었습니다 ✅", "success");
        navigate("/tickets");
      } else addToast(res.data.message || "삭제 실패 ❌", "error");
    } catch (err) {
      console.error("티켓 삭제 오류:", err);
      addToast("삭제 중 오류가 발생했습니다.", "error");
    } finally {
      setIsDeleteOpen(false);
    }
  };

  /** ✅ 판매 상태 토글 (ING ↔ END) */
  const handleToggleState = async () => {
    if (!ticket) return;
    try {
      const newState = ticket.state === "ING" ? "END" : "ING";
      const res = await axiosInstance.put(`/api/tickets/state/${ticket.tsId}`, {
        state: newState,
      });

      if (res.data?.status === "success") {
        addToast(
          newState === "END"
            ? "판매가 완료되었습니다 🎉"
            : "판매중으로 변경되었습니다 ✅",
          "success"
        );
        setTicket((prev) => (prev ? { ...prev, state: newState } : prev));
      } else {
        addToast(res.data?.message || "상태 변경 실패 ❌", "error");
      }
    } catch (err) {
      console.error("상태 변경 오류:", err);
      addToast("서버 오류가 발생했습니다.", "error");
    }
  };

  // 티켓 거래 참여 (채팅방 연결)
  const handleJoinTicket = () => {
    if (!user) {
      addToast("로그인 후 모임에 참여할 수 있어요.", "error");
      return;
    }
    if (!roomId) {
      addToast("채팅방 정보를 불러오지 못했습니다.", "error");
      return;
    }
    openPopup(roomId, ticket!.title);
  };

  if (isLoading)
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-500">
        티켓 정보를 불러오는 중입니다...
      </main>
    );

  if (!ticket)
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-500">
        해당 티켓 정보를 찾을 수 없습니다.
      </main>
    );

  const isSeller = user?.nickname === ticket.nickname;

  return (
    <main className="bg-white flex items-center justify-center py-10 px-4">
      <div className="relative w-full max-w-7xl">
        <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-sm">
          {/* 상단 */}
          <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-10">
            <div className="relative w-full h-[450px] bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100">
              <span
                className={`absolute top-3 left-3 px-3 py-1.5 text-sm font-semibold rounded-md text-white ${
                  ticket.state === "ING" ? "bg-[#6F00B6]" : "bg-gray-400"
                }`}
              >
                {ticket.state === "ING" ? "판매중" : "판매완료"}
              </span>
              <img
                src={
                  ticket.imageUrl ?? getDefaultStadiumImage(ticket.stadiumName)
                }
                alt="티켓 이미지"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-900 tracking-tight">
                  {ticket.title}
                </h2>

                <div className="text-gray-700 mb-4 divide-y divide-gray-100">
                  {[
                    {
                      icon: <FiCalendar size={22} className="text-gray-500" />,
                      text: ticket.gameDay
                        ? new Date(ticket.gameDay).toLocaleString("ko-KR", {
                            timeZone: "Asia/Seoul",
                          })
                        : "날짜 정보 없음",
                    },
                    {
                      icon: (
                        <MdOutlineSportsBaseball
                          size={22}
                          className="text-gray-500"
                        />
                      ),
                      text: `${ticket.home} vs ${ticket.away}`,
                    },
                    {
                      icon: <FiMapPin size={22} className="text-gray-500" />,
                      text: ticket.stadium,
                    },
                    {
                      icon: <PiSeat size={22} className="text-gray-500" />,
                      text:
                        ticket.adjacentSeat === "Y"
                          ? "인접 좌석: 예"
                          : "인접 좌석: 아니오",
                    },
                    {
                      icon: (
                        <HiOutlineUsers size={22} className="text-gray-500" />
                      ),
                      text: `판매자: ${ticket.nickname}`,
                    },
                    {
                      icon: (
                        <FiCreditCard size={22} className="text-gray-500" />
                      ),
                      text: `가격: ${(ticket.price ?? 0).toLocaleString()}원 (${
                        ticket.ticketCount ?? 1
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

                <div className="mb-8 mt-4">
                  <button
                    onClick={
                      ticket.state === "ING" ? handleJoinTicket : undefined
                    }
                    disabled={ticket.state !== "ING"}
                    className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2 ${
                      ticket.state === "ING"
                        ? "bg-gradient-to-r from-[#8A2BE2] to-[#6F00B6] text-white hover:opacity-90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <FiMessageSquare size={20} />
                    판매자와 채팅 시작하기
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <ShareButton />
                  {isSeller && (
                    <>
                      {/* ✅ 판매상태 변경 버튼 추가 */}
                      <button
                        onClick={handleToggleState}
                        className={`flex items-center gap-1.5 text-sm font-medium transition ${
                          ticket.state === "ING"
                            ? "text-[#6F00B6] hover:text-[#8A2BE2]"
                            : "text-gray-600 hover:text-[#6F00B6]"
                        }`}
                      >
                        <FiRepeat size={16} />{" "}
                        {ticket.state === "ING"
                          ? "판매 완료로 변경"
                          : "판매 중으로 변경"}
                      </button>

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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 상세 설명 & 판매자 정보 */}
          <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-8 items-stretch">
            <div className="bg-gray-50 rounded-xl p-6 min-h-[370px] flex flex-col overflow-y-auto border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                티켓 상세 설명
              </h3>
              <p className="text-[17px] md:text-lg text-gray-800 leading-[1.9] whitespace-pre-line flex-1">
                {ticket.description || "판매자가 작성한 상세 설명이 없습니다."}
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-3 text-lg">
                  💁 판매자 정보
                </h4>
                <div className="flex items-center gap-4 mt-8 mb-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8A2BE2] to-[#6F00B6] flex items-center justify-center text-white text-xl font-bold shadow-sm flex-shrink-0">
                    {ticket.nickname?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div className="flex flex-col justify-center leading-tight">
                    <p className="text-[15px] font-semibold text-gray-900">
                      {ticket.nickname ?? "익명"}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-[2px]">
                      ⭐ {(ticket.rating ?? 0).toFixed(1)} / 5.0
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
        onConfirm={handleDelete}
      />

      {isEditOpen && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            fetchTicket(); // ✅ 수정 완료 후 최신 데이터 다시 불러오기
          }}
        >
          <TicketForm
            mode="edit"
            initialValues={ticket}
            onClose={() => {
              setIsEditOpen(false);
              fetchTicket(); // ✅ 모달 닫을 때 새로고침 효과
            }}
            onSuccess={() => {
              fetchTicket(); // ✅ 수정 성공 시 데이터 갱신
            }}
          />
        </Modal>
      )}
    </main>
  );
}
