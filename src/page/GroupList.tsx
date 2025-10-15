import { useEffect, useState, useCallback } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import SearchPanel from "../components/SearchPanel";
import GroupCard from "../components/groups/GroupCard";
import ListHeader from "../components/ListHeader";
import GroupForm from "../components/groups/GroupForm";
import Modal from "../components/Modal";
import axiosInstance from "../lib/axiosInstance";
import type { CommunityItem, ApiResponse, GroupUI } from "../types/group";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import { useGroupUpdateStore } from "../store/groupUpdateStore";

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
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();
  const { updated, resetUpdate } = useGroupUpdateStore();

  // 모임 목록 + 이미지 불러오기
  const fetchGroups = useCallback(
    async (sort: SortType = "RECENT", pageNum: number = 0) => {
      setLoading(true);
      try {
        const res = await axiosInstance.get<
          ApiResponse<PageResponse<CommunityItem>>
        >(`/api/communities?page=${pageNum}&size=12&sortType=${sort}`);

        if (res.data.status === "success" && res.data.data) {
          const { content, totalPages } = res.data.data;

          const mappedGroups: GroupUI[] = content.map((g) => ({
            id: g.communityId,
            title: g.title,
            content: g.description,
            date: g.date,
            stadiumName: g.stadium,
            teams: `${g.home} vs ${g.away}`,
            personnel: g.memberCount,
            leader: g.nickname,
            status: g.state === "ING" ? "모집중" : "모집마감",
            imageUrl: g.imageUrl
              ? `http://localhost:8080/images/${g.imageUrl.replace(/^\/+/, "")}`
              : undefined,
          }));

          setGroups(mappedGroups);
          setTotalPages(totalPages);
          setPage(pageNum);
        }
      } catch (error) {
        console.error("모임 목록 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchGroups(sortType, 0);
  }, [sortType, fetchGroups]);

  useEffect(() => {
    if (updated) {
      fetchGroups(sortType, 0);
      resetUpdate();
    }
  }, [updated, sortType, fetchGroups, resetUpdate]);

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

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      addToast("로그인 후 모임을 등록할 수 있어요.", "error");
      return;
    }
    setIsCreateOpen(true);
  };

  const handleCreateSuccess = (newGroup?: CommunityItem) => {
    if (!newGroup) return;

    const formattedGroup: GroupUI = {
      id: newGroup.communityId,
      title: newGroup.title,
      content: newGroup.description,
      date: newGroup.date,
      stadiumName: newGroup.stadium,
      teams: `${newGroup.home} vs ${newGroup.away}`,
      personnel: newGroup.memberCount,
      leader: newGroup.nickname,
      status: newGroup.state === "ING" ? "모집중" : "모집마감",
      imageUrl: newGroup.imageUrl
        ? `http://localhost:8080/images/${newGroup.imageUrl.replace(
            /^\/+/,
            ""
          )}`
        : undefined,
    };

    setGroups((prev) => [formattedGroup, ...prev]);
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
            onButtonClick={handleCreateClick}
          />
        </div>

        {/* 카드 리스트 */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">
            모임 목록을 불러오는 중입니다...
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))]">
            {groups.map((group) => (
              <GroupCard key={group.id} {...group} />
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-3 text-sm">
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
          onClose={() => setIsCreateOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </Modal>
    </div>
  );
}
