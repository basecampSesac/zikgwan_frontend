import { useEffect, useState } from "react";
import SearchPanel from "../components/SearchPanel";
import GroupCard from "../components/groups/GroupCard";
import ListHeader from "../components/ListHeader";
import GroupForm from "../components/groups/GroupForm";
import Modal from "../components/Modal";
import axiosInstance from "../lib/axiosInstance";
import type { CommunityItem, ApiResponse, GroupUI } from "../types/group";

type SortType = "RECENT" | "MOST" | "LEAST";

export default function GroupList() {
  const [groups, setGroups] = useState<GroupUI[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sortType, setSortType] = useState<SortType>("RECENT");

  // 모임 목록 조회
  const fetchGroups = async (sort: SortType = "RECENT"): Promise<void> => {
    try {
      const res = await axiosInstance.get<ApiResponse<CommunityItem[]>>(
        `/api/communities?sortType=${sort}`
      );

      if (res.data.status === "success" && Array.isArray(res.data.data)) {
        const mapped: GroupUI[] = res.data.data.map((g) => ({
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
      } else {
        console.warn("서버 응답 형식이 예상과 다릅니다:", res.data);
      }
    } catch (error) {
      console.error("모임 목록 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchGroups(sortType);
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

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 검색 패널 */}
        <div className="mb-6">
          <SearchPanel
            title="모임 검색"
            onSearch={setGroups}
            onReset={() => fetchGroups()}
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
      </div>

      {/* 등록 모달 */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <GroupForm
          mode="create"
          onClose={() => {
            setIsCreateOpen(false);
            fetchGroups();
          }}
        />
      </Modal>
    </div>
  );
}
