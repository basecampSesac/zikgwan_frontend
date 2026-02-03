import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";

interface Group {
  id: number;
  user: string;
  message: string;
  date: string;
}

export default function GroupSection() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get<{ data: Group[] }>(
          "/api/my-groups",
          { key: "mypage-groups" }
        );
        setGroups(res.data);
      } catch (error: any) {
        if (error?.name === "CanceledError") return;
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) return <p className="text-gray-500">불러오는 중...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">내 직관 모임 / 채팅</h2>
      {groups.length === 0 ? (
        <p className="text-gray-500">참여 중인 모임/채팅이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {groups.map((group) => (
            <li
              key={group.id}
              className="flex justify-between items-center p-4 border rounded-lg shadow-sm hover:bg-gray-50 transition"
            >
              {/* 왼쪽: 유저/메시지 */}
              <div className="flex flex-col">
                <p className="font-semibold text-gray-900">{group.user}</p>
                <p className="text-sm text-gray-600 truncate max-w-[200px]">
                  {group.message}
                </p>
              </div>

              {/* 오른쪽: 날짜 */}
              <p className="text-xs text-gray-400 whitespace-nowrap ml-4">
                {new Date(group.date).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
