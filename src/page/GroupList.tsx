import { useEffect, useState, useCallback } from "react";
import SearchPanel from "../components/SearchPanel";
import GroupCard from "../components/groups/GroupCard";
import ListHeader from "../components/ListHeader";
import Pagination from "../components/Pagination";
import GroupForm from "../components/groups/GroupForm";
import Modal from "../components/Modal";
import { useApi } from "../hooks/useApi";
import type { CommunityItem, GroupUI } from "../types/group";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import { useGroupUpdateStore } from "../store/groupUpdateStore";

type SortType = "RECENT" | "MOST" | "LEAST";

export default function GroupList() {
  const [groups, setGroups] = useState<GroupUI[]>([]);
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
  const [_loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();
  const { updated, resetUpdate } = useGroupUpdateStore();
  const api = useApi();

  // 모임 목록 + 이미지 불러오기
  const fetchGroups = useCallback(
    async (
      sort: SortType = "RECENT",
      pageNum: number = 0,
      filter = filters
    ) => {
      setLoading(true);
      try {
        const hasSearch =
          filter.keyword || filter.team || filter.stadium || filter.date;

        const endpoint = hasSearch
          ? "/api/communities/search"
          : "/api/communities";

        const params = hasSearch
          ? {
              title: filter.keyword || undefined,
              team: filter.team || undefined,
              stadium: filter.stadium || undefined,
              date: filter.date ? filter.date.split("T")[0] : undefined,
              page: pageNum,
              size: 12,
              sortType: sort,
            }
          : { page: pageNum, size: 12, sortType: sort };

        const res = await api.get<{ status: string; data: any }>(endpoint, { params, key: "group-list" });

        if (res.status === "success" && res.data) {
          // 페이지형 or 배열형 응답 구분
          let content = [];
          let totalPagesValue = 1;
          let totalElementsValue = 0;

          if (res.data.content) {
            // 페이지네이션 객체 응답
            content = res.data.content;
            totalPagesValue = res.data.totalPages;
            totalElementsValue = res.data.totalElements;
          } else if (Array.isArray(res.data)) {
            // 배열 응답 → 프론트에서 페이지네이션 처리
            content = res.data.slice(pageNum * 12, pageNum * 12 + 12);
            totalPagesValue = Math.ceil(res.data.length / 12);
            totalElementsValue = res.data.length;
          }

          const mapped: GroupUI[] = content.map((g: CommunityItem) => ({
            id: g.communityId,
            title: g.title,
            content: g.description,
            date: g.date,
            stadiumName: g.stadium,
            teams: `${g.home} vs ${g.away}`,
            personnel: g.memberCount,
            leader: g.nickname,
            status:
              g.state === "ING" ? ("모집중" as const) : ("모집마감" as const),
            //기존 코드 (로컬 이미지 경로로 강제 변환)
            // imageUrl: g.imageUrl
            //   ? `http://localhost:8080/images/${g.imageUrl.replace(/^\/+/, "")}`
            //   : undefined,

            //수정된 코드 (백엔드에서 받은 URL 그대로 사용)
            imageUrl: g.imageUrl || undefined,
          }));

          setGroups(mapped);
          setTotalPages(totalPagesValue);
          setTotalCount(totalElementsValue);
          setPage(pageNum);
        }
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        addToast("모임 목록을 불러오지 못했습니다.", "error");
      } finally {
        setLoading(false);
      }
    },
    [filters, addToast]
  );

  useEffect(() => {
    fetchGroups(sortType, 0);
  }, []);

  useEffect(() => {
    if (updated) {
      fetchGroups(sortType, 0);
      resetUpdate();
    }
  }, [updated, sortType, fetchGroups, resetUpdate]);

  const handleSortChange = (value: string) => {
    const nextSort: SortType =
      value === "인원 많은순"
        ? "MOST"
        : value === "인원 적은순"
        ? "LEAST"
        : "RECENT";
    setSortType(nextSort);
    fetchGroups(nextSort, 0, filters);
  };

  const handlePageChange = (pageNum: number) => {
    fetchGroups(sortType, pageNum, filters);
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
      //기존 코드 (로컬 이미지 경로로 강제 변환)
      // imageUrl: newGroup.imageUrl
      //   ? `http://localhost:8080/images/${newGroup.imageUrl.replace(/^\/+/, "")}`
      //   : undefined,

      //수정된 코드
      imageUrl: newGroup.imageUrl || undefined,
    };
    setGroups((prev) => [formattedGroup, ...prev]);
  };

  return (
    <div className="bg-white min-h-screen relative ">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 검색 패널 */}
        <div className="mb-6">
          <SearchPanel
            title="모임 검색"
            mode="group"
            onFilterChange={(newFilters) => {
              setFilters(newFilters);
              fetchGroups(sortType, 0, newFilters);
            }}
            onReset={() => {
              const empty = { keyword: "", team: "", stadium: "", date: "" };
              setFilters(empty);
              fetchGroups(sortType, 0, empty);
            }}
          />
        </div>

        {/* 헤더 */}
        <ListHeader
          title="모임"
          count={totalCount}
          sortOptions={["최신순", "인원 적은순", "인원 많은순"]}
          onSortChange={handleSortChange}
          buttonText="+ 모임 등록"
          onButtonClick={handleCreateClick}
        />

        {/* 카드 리스트 */}
        <div className="min-h-[300px]">
          {groups.length > 0 ? (
            <div className="grid gap-6 grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))]">
              {groups.map((group) => (
                <GroupCard key={group.id} {...group} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-500 py-20">
              등록된 모임이 없습니다.
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
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
