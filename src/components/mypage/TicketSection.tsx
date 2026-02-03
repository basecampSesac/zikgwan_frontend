import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStar,
  FaUser,
  FaChevronDown,
  FaRegCalendarAlt,
} from "react-icons/fa";
import ReviewModal from "../../components/ReviewModal";
import type { CompletedTicket } from "../../types/ticket";
import { useApi } from "../../hooks/useApi";
import { useToastStore } from "../../store/toastStore";
import { useAuthStore } from "../../store/authStore";
import { formatDate } from "../../utils/format";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function TicketSection() {
  const { addToast } = useToastStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const api = useApi();
  const currentUserId = Number(user?.userId || 0);

  const [tickets, setTickets] = useState<CompletedTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<CompletedTicket | null>(
    null
  );
  const [sellerProfileImage, setSellerProfileImage] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // 거래 완료 티켓 조회
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await api.get<{ status: string; data: CompletedTicket[] }>(
        `/api/tickets/completed`,
        { key: "mypage-completed-tickets" }
      );
      if (data.status === "success" && Array.isArray(data.data)) {
        setTickets(data.data);
      } else {
        setError("데이터를 불러오지 못했습니다.");
      }
    } catch (err: any) {
      if (err?.name === "CanceledError") return;
      setError("티켓 데이터를 불러오는 중 오류가 발생했습니다.");
      addToast("티켓 데이터를 불러오는 중 오류가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 첫 페이지 로드
  useEffect(() => {
    fetchTickets();
  }, []);

  // 무한 스크롤
  const groupedTickets = useMemo(() => {
    const groups = tickets.reduce((acc, t) => {
      const dateKey = t.updatedAt
        ? new Date(t.updatedAt).toLocaleDateString("ko-KR")
        : "미확인 거래";
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(t);
      return acc;
    }, {} as Record<string, CompletedTicket[]>);

    return Object.entries(groups).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [tickets]);

  // 리뷰 등록
  const handleOpenReview = async (ticket: CompletedTicket) => {
    try {
      const data = await api.get<{ status: string; data: string }>(
        `/api/images/U/${ticket.sellerId}`,
        { key: `seller-profile-${ticket.sellerId}` }
      );
      if (data.status === "success" && data.data) {
        const rawUrl = data.data.startsWith("http")
          ? data.data
          : `${API_URL}/images/${data.data.replace(/^\/+/, "")}`;
        setSellerProfileImage(rawUrl);
      } else {
        setSellerProfileImage(null);
      }
    } catch (err: any) {
      if (err?.name === "CanceledError") return;
      setSellerProfileImage(null);
    } finally {
      setSelectedTicket(ticket);
    }
  };

  const handleReviewSubmit = (rating: number) => {
    if (!selectedTicket) return;
    setTickets((prev) =>
      prev.map((t) => (t.tsId === selectedTicket.tsId ? { ...t, rating } : t))
    );
    addToast("리뷰가 등록되었습니다.", "success");
    setSelectedTicket(null);
  };

  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {tickets.length === 0 && !loading ? (
        <p className="text-gray-400 text-center mt-10">
          거래 완료된 티켓이 없습니다.
        </p>
      ) : (
        <div className="space-y-10 pb-20">
          {groupedTickets.map(([date, list]) => (
            <section key={date}>
              <h3 className="text-[18px] font-semibold text-gray-800 mb-4">
                {date}
              </h3>

              <ul className="space-y-4">
                {list.map((ticket) => {
                  const isBuyer = Number(ticket.buyerId) === currentUserId;
                  const isSeller = Number(ticket.sellerId) === currentUserId;
                  const isRated = ticket.rating !== null;
                  const hasBuyer =
                    ticket.buyerId !== null && ticket.buyerId !== undefined;

                  return (
                    <li
                      key={ticket.tsId}
                      onClick={() => navigate(`/tickets/${ticket.tsId}`)}
                      className="
                        flex flex-col md:flex-row md:items-center
                        gap-4 md:gap-6
                        bg-white border border-gray-100 transition
                        rounded-xl p-4 md:p-5
                        shadow-sm cursor-pointer
                        hover:shadow-md hover:border-gray-200
                      "
                    >
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                        <h3 className="text-base md:text-[18px] font-semibold text-gray-800 truncate">
                          {ticket.title}
                        </h3>

                        <p className="text-sm text-gray-500 truncate">
                          {ticket.home} vs {ticket.away} · {ticket.stadium}
                        </p>

                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <FaRegCalendarAlt size={11} className="shrink-0" />
                          <span className="truncate">
                            경기일:{" "}
                            {ticket.gameDay
                              ? formatDate(ticket.gameDay)
                              : "미정"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <FaUser size={12} className="shrink-0" />
                          <span className="truncate">
                            판매자 {ticket.sellerNickname || "알 수 없음"}
                          </span>
                        </div>
                      </div>

                      <div
                        className="
                          w-full
                          flex flex-col items-start gap-2
                          md:w-auto md:items-end md:min-w-[140px] md:shrink-0
                        "
                      >
                        <span className="text-base md:text-[18px] font-semibold text-gray-700">
                          {ticket.price.toLocaleString()}원
                        </span>

                        {isRated ? (
                          <div className="flex items-center gap-1 text-yellow-500 font-bold">
                            <FaStar
                              size={13}
                              className="text-yellow-400 shrink-0"
                            />
                            <span className="text-sm md:text-base">
                              {ticket.rating?.toFixed(1)}
                            </span>
                          </div>
                        ) : isBuyer && hasBuyer ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReview(ticket);
                            }}
                            className="
                              px-3 py-2
                              text-sm md:text-[15px]
                              font-semibold text-white
                              bg-[#6F00B6] rounded-md
                              hover:bg-[#57008f] transition
                              w-fit
                              whitespace-nowrap
                            "
                          >
                            거래 평가하기
                          </button>
                        ) : isSeller && hasBuyer ? (
                          <span className="text-xs md:text-sm font-semibold text-gray-400 whitespace-nowrap">
                            구매자 평가 대기중
                          </span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <div
            ref={observerRef}
            className="flex justify-center items-center py-6 text-gray-400"
          >
            {!loading && (
              <FaChevronDown
                className="text-gray-400 animate-bounce"
                size={22}
              />
            )}
          </div>
        </div>
      )}

      <ReviewModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        sellerName={`판매자 ${selectedTicket?.sellerNickname ?? ""}`}
        sellerId={selectedTicket?.sellerId ?? 0}
        tsId={selectedTicket?.tsId ?? 0}
        sellerImage={sellerProfileImage}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
