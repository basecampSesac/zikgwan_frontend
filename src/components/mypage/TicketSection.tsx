import { useEffect, useState, useMemo, useRef } from "react";
import { FaStar, FaUser } from "react-icons/fa";
import ReviewModal from "../../components/ReviewModal";
import type { CompletedTicket } from "../../types/ticket";
import axiosInstance from "../../lib/axiosInstance";
import { useToastStore } from "../../store/toastStore";

export default function TicketSection() {
  const { addToast } = useToastStore();
  const { userId: currentUserId = 1 } = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [tickets, setTickets] = useState<CompletedTicket[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<CompletedTicket | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // 거래 완료 티켓 조회
  const fetchTickets = async (pageNum: number) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(
        `/api/tickets/completed?page=${pageNum}`
      );

      if (data.status === "success" && Array.isArray(data.data)) {
        // 페이지네이션 지원용 예시
        if (data.data.length === 0) {
          setHasMore(false);
        } else {
          setTickets((prev) => [...prev, ...data.data]);
        }
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
    fetchTickets(1);
  }, [addToast]);

  // 무한 스크롤
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // 페이지 변경 시 다음 데이터 로드
  useEffect(() => {
    if (page > 1) fetchTickets(page);
  }, [page]);

  // 날짜별 그룹 정리
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
                  const isBuyer = Number(ticket.buyerId) === currentUserId;
                  const isSeller = Number(ticket.sellerId) === currentUserId;
                  const isRated = ticket.rating !== null;

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
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <FaUser size={12} />
                          <span>판매자 {ticket.sellerId}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between h-[100px]">
                        <span className="text-sm font-semibold text-gray-700 text-[18px] mt-3">
                          {ticket.price.toLocaleString()}원
                        </span>

                        {isRated ? (
                          <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold text-[20px] mb-4">
                            <FaStar size={13} className="text-yellow-400" />
                            <span>{ticket.rating?.toFixed(1)}</span>
                          </div>
                        ) : isBuyer ? (
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="px-3 py-1 text-[17px] font-semibold text-white bg-[#6F00B6] rounded-md hover:bg-[#57008f] transition mb-4"
                          >
                            거래 평가하기
                          </button>
                        ) : isSeller ? (
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

          {hasMore && (
            <div
              ref={observerRef}
              className="flex justify-center items-center py-6 text-gray-400"
            >
              {loading ? "불러오는 중..." : "스크롤 시 다음 페이지 불러오기"}
            </div>
          )}
        </div>
      )}

      <ReviewModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        sellerName={`판매자 ${selectedTicket?.sellerId ?? ""}`}
        tsId={selectedTicket?.tsId ?? 0}
        sellerRating={selectedTicket?.rating || 0}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
