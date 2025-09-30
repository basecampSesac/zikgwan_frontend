// src/components/mypage/GroupSection.tsx
export default function GroupSection() {
  // TODO: 나중에 /api/my-groups 불러오기
  const groups = [
    {
      id: 1,
      user: "야구 매니아",
      message: "빠른 거래 감사합니다. 좋은 밤 보내세요.",
      date: "2024.05.15",
    },
    {
      id: 2,
      user: "LG 팬",
      message: "언제 계좌 주시나요?",
      date: "2024.05.20",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">내 직관 모임 / 채팅</h2>
      <ul className="space-y-4">
        {groups.map((group) => (
          <li
            key={group.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{group.user}</p>
              <p className="text-sm text-gray-600">{group.message}</p>
            </div>
            <p className="text-xs text-gray-400">{group.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
