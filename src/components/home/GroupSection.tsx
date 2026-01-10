import { memo } from "react";
import GroupCard from "../groups/GroupCard";
import type { GroupUI } from "../../types/group";
import { useApiData } from "../../hooks/useApiData";

// API 응답 타입 정의
interface CommunityApiResponse {
  communityId: number;
  title: string;
  description: string;
  date: string;
  home: string;
  away: string;
  stadium: string;
  memberCount: number;
  nickname: string;
  isFull: boolean;
  imageUrl: string;
}

const GroupSection = function GroupSection() {
  const { data: groups, loading } = useApiData<GroupUI[]>(
    "/api/communities/closing-soon",
    {
      errorMessage: "모임 정보를 불러오지 못했습니다.",
      transform: (data) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: expected array");
        }
        return data.map((item: CommunityApiResponse) => ({
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
      }
    }
  );

return (
    <div>
      <h2 className="text-xl font-bold mb-4">👫 마감 직전인 모임</h2>
      {loading && (
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {groups && groups.length > 0 ? (
          groups.map((group) => <GroupCard key={group.id} {...group} />)
        ) : (
          <p className="text-gray-500 text-sm">불러올 모임이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default memo(GroupSection);
