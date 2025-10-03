import { useState } from "react";
import SearchPanel from "../components/SearchPanel";
import GroupCard from "../components/groups/GroupCard";
import ListHeader from "../components/ListHeader";
import GroupForm from "../components/groups/GroupForm";
import Modal from "../components/Modal";
import { groupsMock } from "../data/mock";
import type { GroupUI } from "../types/group";

export default function GroupList() {
  const groups: GroupUI[] = groupsMock;
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 검색 패널 */}
        <div className="mb-6">
          <SearchPanel title="모임 검색" showPrice={false} />
        </div>

        {/* 리스트 헤더 + 모임 등록 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <ListHeader
            title="모임"
            count={groups.length}
            sortOptions={["최신순", "인원 많은순", "인원 적은순"]}
            buttonText="+ 모임 등록"
            onButtonClick={() => setIsCreateOpen(true)}
          />
        </div>

        {/* 카드 그리드 */}
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))]">
          {groups.map((group) => (
            <GroupCard key={group.id} {...group} />
          ))}
        </div>
      </div>

      {/* 등록 모달 */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <GroupForm mode="create" onClose={() => setIsCreateOpen(false)} />
      </Modal>
    </div>
  );
}
