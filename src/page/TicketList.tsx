import { useEffect, useState } from "react";
import SearchPanel from "../components/SearchPanel";
import TicketCard from "../components/tickets/TicketCard";
import TicketForm from "../components/tickets/TicketForm";
import ListHeader from "../components/ListHeader";
import Modal from "../components/Modal";
import axiosInstance from "../lib/axiosInstance";
import type { TicketUI } from "../types/ticket";
import { useToastStore } from "../store/toastStore";

type SortType = "RECENT" | "LOW" | "HIGH";
interface TicketResponse {
  tsId: number;
  title: string;
  description: string;
  gameDay: string;
  price: number;
  ticketCount: number;
  stadium: string;
  state: "ING" | "DONE";
  imageUrl?: string;
  nickname: string;
  rating?: number;
}

export default function TicketList() {
  const [tickets, setTickets] = useState<TicketUI[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sortType, setSortType] = useState<SortType>("RECENT");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToastStore();

  /** ✅ 티켓 목록 조회 */
  const fetchTickets = async (sort: SortType = "RECENT", pageNum = 0) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/tickets/all`, {
        params: { page: pageNum, size: 12, sortType: sort },
      });

      if (res.data.status === "success" && res.data.data) {
        const { content, totalPages } = res.data.data;

        const mapped: TicketUI[] = (content as TicketResponse[]).map((t) => ({
          id: t.tsId,
          title: t.title,
          description: t.description,
          gameDate: t.gameDay,
          price: t.price,
          ticketCount: t.ticketCount,
          stadiumName: t.stadium,
          status: t.state === "ING" ? "판매중" : "판매완료",
          imageUrl: t.imageUrl
            ? `http://localhost:8080/images/${t.imageUrl.replace(/^\/+/, "")}`
            : "",
          seller: {
            nickname: t.nickname,
            rate: t.rating || 0,
          },
        }));

        setTickets(mapped);
        setPage(pageNum);
        setTotalPages(totalPages);
      } else {
        addToast("티켓 목록을 불러오지 못했습니다.", "error");
      }
    } catch (err) {
      console.error("티켓 목록 조회 실패:", err);
      addToast("서버 오류가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 정렬 변경 */
  const handleSortChange = (value: string) => {
    const nextSort: SortType =
      value === "낮은 가격순"
        ? "LOW"
        : value === "높은 가격순"
        ? "HIGH"
        : "RECENT";
    setSortType(nextSort);
    fetchTickets(nextSort, 0);
  };

  /** ✅ 페이지 이동 */
  const handlePageChange = (pageNum: number) => {
    fetchTickets(sortType, pageNum);
  };

  useEffect(() => {
    fetchTickets(sortType, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 검색 패널 */}
        <div className="mb-6">
          <SearchPanel title="티켓 검색" showPrice={true} />
        </div>

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <ListHeader
            title="티켓"
            count={tickets.length}
            sortOptions={["최신순", "낮은 가격순", "높은 가격순"]}
            buttonText="+ 티켓 등록"
            onSortChange={handleSortChange}
            onButtonClick={() => setIsCreateOpen(true)}
          />
        </div>

        {/* 카드 리스트 */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">
            티켓을 불러오는 중입니다...
          </div>
        ) : tickets.length > 0 ? (
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))]">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} {...ticket} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            등록된 티켓이 없습니다.
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-10 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                  page === i
                    ? "bg-[#6F00B6] text-white border-[#6F00B6]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ✅ 등록 모달 */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <TicketForm
          mode="create"
          onClose={() => {
            setIsCreateOpen(false);
            fetchTickets(sortType, 0);
          }}
        />
      </Modal>
    </div>
  );
}
