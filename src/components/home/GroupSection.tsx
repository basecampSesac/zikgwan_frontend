import { useEffect, useState } from "react";
import GroupCard from "../groups/GroupCard";
import type { GroupUI } from "../../types/group";
import axiosInstance from "../../lib/axiosInstance";
import { useToastStore } from "../../store/toastStore";

export default function GroupSection() {
  const [groups, setGroups] = useState<GroupUI[]>([]);
  const { addToast } = useToastStore();

  useEffect(() => {
    const fetchClosingSoonGroups = async () => {
      try {
        const res = await axiosInstance.get("/api/communities/closing-soon");
        if (res.data.status === "success" && Array.isArray(res.data.data)) {
          const formatted = res.data.data.map((item: any) => ({
            id: item.communityId,
            title: item.title,
            description: item.description,
            date: item.date,
            teams: `${item.home} vs ${item.away}`,
            stadiumName: item.stadium,
            personnel: item.memberCount,
            leader: item.nickname,
            status: item.isFull ? "모집마감" : "모집중",
            imageUrl: item.imageUrl,
          }));
          setGroups(formatted);
        } else {
          addToast("모임 정보를 불러오지 못했습니다.", "error");
        }
      } catch (err) {
        console.error("🚨 마감 직전 모임 불러오기 실패:", err);
        addToast("마감 직전 모임을 불러오지 못했습니다.", "error");
      }
    };

    fetchClosingSoonGroups();
  }, [addToast]);

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
