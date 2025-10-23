import { useEffect, useState, useMemo, useRef } from "react";
import {
  FaStar,
  FaUser,
  FaChevronDown,
  FaRegCalendarAlt,
} from "react-icons/fa";
import ReviewModal from "../../components/ReviewModal";
import type { CompletedTicket } from "../../types/ticket";
import axiosInstance from "../../lib/axiosInstance";
import { useToastStore } from "../../store/toastStore";
import { useAuthStore } from "../../store/authStore";
import { formatDate } from "../../utils/format";

export default function TicketSection() {
  const { addToast } = useToastStore();
  const { user } = useAuthStore();
  const currentUserId = Number(user?.userId || 0);

  const [tickets, setTickets] = useState<CompletedTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<CompletedTicket | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // 거래 완료 티켓 조회
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/api/tickets/completed`);
      if (data.status === "success" && Array.isArray(data.data)) {
        setTickets(data.data);
      } else {
        setError("데이터를 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error("🚨 티켓 조회 실패:", err);
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
                  const isBuyer =
                    Number(ticket.buyerId) === Number(currentUserId);
                  const isSeller =
                    Number(ticket.sellerId) === Number(currentUserId);
                  const isRated = ticket.rating !== null;
                  const hasBuyer =
                    ticket.buyerId !== null && ticket.buyerId !== undefined;

                  return (
                    <li
                      key={ticket.tsId}
                      className="flex items-center gap-6 bg-white border border-gray-100 transition rounded-xl p-5 shadow-sm min-h-[120px]"
                    >
                      <div className="flex-1 flex flex-col justify-center gap-1">
                        <h3 className="text-[18px] font-semibold text-gray-800 truncate">
                          {ticket.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {ticket.home} vs {ticket.away} · {ticket.stadium}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <FaRegCalendarAlt
                            size={11}
                            className="text-gray-400"
                          />
                          <span>
                            경기일:{" "}
                            {ticket.gameDay
                              ? formatDate(ticket.gameDay)
                              : "미정"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <FaUser size={12} />
                          <span>
                            판매자 {ticket.sellerNickname || "알 수 없음"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between h-[100px]">
                        <span className="text-sm font-semibold text-gray-700 text-[18px] mt-3">
                          {ticket.price.toLocaleString()}원
                        </span>

                        {/* 평가 상태별 UI */}
                        {isRated ? (
                          <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold text-[20px] mb-4">
                            <FaStar size={13} className="text-yellow-400" />
                            <span>{ticket.rating?.toFixed(1)}</span>
                          </div>
                        ) : isBuyer && hasBuyer ? (
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="px-3 py-1 text-[17px] font-semibold text-white bg-[#6F00B6] rounded-md hover:bg-[#57008f] transition mb-4"
                          >
                            거래 평가하기
                          </button>
                        ) : isSeller && hasBuyer ? (
                          <span className="text-xs font-semibold text-gray-400 text-[17px] mb-5">
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
        tsId={selectedTicket?.tsId ?? 0}
        sellerRating={selectedTicket?.rating || 0}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
