import { useEffect, useState } from "react";
import GroupCard from "../groups/GroupCard";
import type { GroupUI } from "../../types/group";
import { useApi } from "../../hooks/useApi";
import { useToastStore } from "../../store/toastStore";

export default function GroupSection() {
  const [groups, setGroups] = useState<GroupUI[]>([]);
  const { addToast } = useToastStore();
  const api = useApi();

  useEffect(() => {
    const fetchClosingSoonGroups = async () => {
      try {
        const res = await api.get<{ status: string; data: any[] }>(
          "/api/communities/closing-soon",
          { key: "home-group-section" }
        );
        if (res.status === "success" && Array.isArray(res.data)) {
          const formatted: GroupUI[] = res.data.map((item: any) => ({
            id: item.communityId,
            title: item.title,
            description: item.description,
            date: item.date,
            teams: `${item.home} vs ${item.away}`,
            stadiumName: item.stadium,
            personnel: item.memberCount,
            leader: item.nickname,
            status: item.isFull ? "모집마감" as const : "모집중" as const,
            imageUrl: item.imageUrl,
          }));
          setGroups(formatted);
        } else {
          addToast("모임 정보를 불러오지 못했습니다.", "error");
        }
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        addToast("마감 직전 모임을 불러오지 못했습니다.", "error");
      }
    };

    fetchClosingSoonGroups();
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
