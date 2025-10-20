import { useEffect, useState, useCallback } from "react";
import SearchPanel from "../components/SearchPanel";
import TicketCard from "../components/tickets/TicketCard";
import TicketForm from "../components/tickets/TicketForm";
import ListHeader from "../components/ListHeader";
import Pagination from "../components/Pagination";
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
  home: string;
  away: string;
  stadium: string;
  adjacentSeat: "Y" | "N";
  nickname: string;
  rating?: number | null;
  state: "ING" | "DONE";
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TicketList() {
  const [tickets, setTickets] = useState<TicketUI[]>([]);
  const [filters, setFilters] = useState({
    keyword: "",
    team: "",
    stadium: "",
    date: "",
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sortType, setSortType] = useState<SortType>("RECENT");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const { addToast } = useToastStore();

  // 티켓 목록 조회
  const fetchTickets = useCallback(
    async (sort: SortType = "RECENT", pageNum = 0, filter?: typeof filters) => {
      setLoading(true);
      try {
        const activeFilter = filter || filters;
        const hasFilter =
          activeFilter.keyword ||
          activeFilter.team ||
          activeFilter.stadium ||
          activeFilter.date;

        const endpoint = hasFilter ? "/api/tickets/search" : "/api/tickets/all";

        const res = await axiosInstance.get(endpoint, {
          params: hasFilter
            ? {
                title: activeFilter.keyword || undefined,
                team: activeFilter.team || undefined,
                stadium: activeFilter.stadium || undefined,
                date: activeFilter.date || undefined,
              }
            : {
                page: pageNum,
                size: 12,
                sortType: sort,
              },
        });

        if (res.data.status === "success" && res.data.data) {
          const resultData = Array.isArray(res.data.data)
            ? res.data.data
            : res.data.data.content;

          const mapped: TicketUI[] = (resultData as TicketResponse[]).map(
            (t) => ({
              tsId: t.tsId,
              title: t.title,
              description: t.description,
              price: t.price,
              gameDay: t.gameDay,
              ticketCount: t.ticketCount,
              home: t.home,
              away: t.away,
              stadium: t.stadium,
              adjacentSeat: t.adjacentSeat,
              nickname: t.nickname,
              rating: t.rating ?? null,
              state: t.state,
              imageUrl: t.imageUrl
                ? `http://localhost:8080/images/${t.imageUrl.replace(
                    /^\/+/,
                    ""
                  )}`
                : "",
              createdAt: t.createdAt,
              updatedAt: t.updatedAt,
            })
          );

          setTickets(mapped);
          setTotalPages(
            Array.isArray(res.data.data) ? 1 : res.data.data.totalPages
          );
          setTotalCount(
            Array.isArray(res.data.data)
              ? res.data.data.length
              : res.data.data.totalElements
          );
          setPage(pageNum);
        }
      } catch (err) {
        console.error("티켓 목록 조회 실패:", err);
        addToast("티켓 목록을 불러오지 못했습니다.", "error");
      } finally {
        setLoading(false);
      }
    },
    [filters, addToast]
  );

  // 정렬 변경
  const handleSortChange = (value: string) => {
    const nextSort: SortType =
      value === "낮은 가격순"
        ? "LOW"
        : value === "높은 가격순"
        ? "HIGH"
        : "RECENT";
    setSortType(nextSort);
    fetchTickets(nextSort, 0, filters);
  };

  // 페이지 이동
  const handlePageChange = (pageNum: number) => {
    fetchTickets(sortType, pageNum, filters);
  };

  // 초기 로드
  useEffect(() => {
    fetchTickets(sortType, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 검색 패널 */}
        <div className="mb-6">
          <SearchPanel
            title="티켓 검색"
            mode="ticket"
            onFilterChange={(newFilters) => {
              setFilters(newFilters);
              fetchTickets(sortType, 0, newFilters);
            }}
            onReset={() => {
              const empty = { keyword: "", team: "", stadium: "", date: "" };
              setFilters(empty);
              fetchTickets(sortType, 0, empty);
            }}
          />
        </div>

        {/* 헤더 */}
        <ListHeader
          title="티켓"
          count={totalCount}
          sortOptions={["최신순", "낮은 가격순", "높은 가격순"]}
          onSortChange={handleSortChange}
          buttonText="+ 티켓 등록"
          onButtonClick={() => setIsCreateOpen(true)}
        />

        {/* 카드 리스트 */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">
            티켓을 불러오는 중입니다...
          </div>
        ) : tickets.length > 0 ? (
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))]">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.tsId} {...ticket} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            등록된 티켓이 없습니다.
          </div>
        )}

        {/* 페이지네이션 */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* 등록 모달 */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <TicketForm
          mode="create"
          onClose={() => {
            setIsCreateOpen(false);
            fetchTickets(sortType, 0, filters);
          }}
        />
      </Modal>
    </div>
  );
}
