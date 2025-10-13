import { useEffect, useState } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import SearchPanel from "../components/SearchPanel";
import GroupCard from "../components/groups/GroupCard";
import ListHeader from "../components/ListHeader";
import GroupForm from "../components/groups/GroupForm";
import Modal from "../components/Modal";
import axiosInstance from "../lib/axiosInstance";
import type { CommunityItem, ApiResponse, GroupUI } from "../types/group";

type SortType = "RECENT" | "MOST" | "LEAST";

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export default function GroupList() {
  const [groups, setGroups] = useState<GroupUI[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sortType, setSortType] = useState<SortType>("RECENT");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 모임 목록 조회
  const fetchGroups = async (
    sort: SortType = "RECENT",
    pageNum: number = 0
  ) => {
    try {
      const res = await axiosInstance.get<
        ApiResponse<PageResponse<CommunityItem>>
      >(`/api/communities?page=${pageNum}&size=12&sortType=${sort}`);

      if (res.data.status === "success" && res.data.data) {
        const { content, totalPages } = res.data.data;

        const mapped: GroupUI[] = content.map((g) => ({
          id: g.communityId,
          title: g.title,
          content: g.description,
          date: g.date,
          stadiumName: g.stadium,
          teams: `${g.home} vs ${g.away}`,
          personnel: g.memberCount,
          leader: g.nickname,
          status: g.state === "ING" ? "모집중" : "모집마감",
        }));

        setGroups(mapped);
        setTotalPages(totalPages);
        setPage(pageNum);
      } else {
        console.warn("서버 응답 형식이 예상과 다릅니다:", res.data);
      }
    } catch (error) {
      console.error("모임 목록 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchGroups(sortType, 0);
  }, [sortType]);

  const handleSortChange = (value: string): void => {
    const nextSort: SortType =
      value === "인원 많은순"
        ? "MOST"
        : value === "인원 적은순"
        ? "LEAST"
        : "RECENT";
    setSortType(nextSort);
  };

  const handlePageChange = (pageNum: number) => {
    fetchGroups(sortType, pageNum);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 검색 패널 */}
        <div className="mb-6">
          <SearchPanel
            title="모임 검색"
            onSearch={setGroups}
            onReset={() => fetchGroups(sortType, 0)}
          />
        </div>

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <ListHeader
            title="모임"
            count={groups.length}
            sortOptions={["최신순", "인원 많은순", "인원 적은순"]}
            onSortChange={handleSortChange}
            buttonText="+ 모임 등록"
            onButtonClick={() => setIsCreateOpen(true)}
          />
        </div>

        {/* 카드 리스트 */}
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))]">
          {groups.map((group) => (
            <GroupCard key={group.id} {...group} />
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-3 text-sm">
            {/* 이전 페이지 */}
            <button
              onClick={() => handlePageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className={`flex items-center justify-center px-3 py-2 rounded-md transition-all duration-150 ${
                page === 0
                  ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                  : "text-gray-500 bg-white hover:bg-gray-100"
              }`}
            >
              <AiOutlineLeft size={18} />
            </button>

            {/* 페이지 번호 */}
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-150 ${
                  page === i
                    ? "bg-gray-200 text-gray-800"
                    : "text-gray-600 bg-white hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            {/* 다음 페이지 */}
            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages - 1, page + 1))
              }
              disabled={page === totalPages - 1}
              className={`flex items-center justify-center px-3 py-2 rounded-md transition-all duration-150 ${
                page === totalPages - 1
                  ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                  : "text-gray-500 bg-white hover:bg-gray-100"
              }`}
            >
              <AiOutlineRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* 등록 모달 */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <GroupForm
          mode="create"
          onClose={() => {
            setIsCreateOpen(false);
            fetchGroups(sortType, 0);
          }}
        />
      </Modal>
    </div>
  );
}
