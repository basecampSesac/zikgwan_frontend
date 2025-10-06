import { useEffect, useState } from "react";
import GroupCard from "../groups/GroupCard";
import type { GroupUI } from "../../types/group";
// ✅ 더미 데이터 import
import { groupsMock } from "../../data/mock";
export default function GroupSection() {
  const [groups, setGroups] = useState<GroupUI[]>([]);

  useEffect(() => {
    // ✅ 실제 API 대신 더미 데이터 세팅
    setGroups(groupsMock);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">👫 마감 직전인 모임</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {groups.length > 0 ? (
          groups.map((group) => <GroupCard key={group.id} {...group} />)
        ) : (
          <p className="text-gray-500 text-sm">불러올 모임이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
