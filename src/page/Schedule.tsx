import { useEffect, useState } from "react";
import type { Match } from "../types/match";
import axiosInstance from "../lib/axiosInstance";

export default function SchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axiosInstance.post("/api/match/");
        if (res.data.status === "success") {
          setMatches(res.data.data);
        }
      } catch (err) {
        console.error("경기 일정 불러오기 실패:", err);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-700 mb-6">경기 일정</h1>
        {/* 경기 없을 때 */}
        {matches.length === 0 ? (
          <p className="text-gray-500">등록된 경기 일정이 없습니다.</p>
        ) : (
          <div className="space-y-8">
            {/* 날짜별 그룹핑 */}
            {groupByDate(matches).map(([date, games]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-[#6F00B6] mb-3">
                  {formatDate(date)} {/* 2025-09-20 → 9월 20일 (토) */}
                </h2>
                <ul className="space-y-2">
                  {games.map((game, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition"
                    >
                      {/* 팀 vs 팀 */}
                      <span className="font-bold text-gray-700 text-base">
                        {game.home} <span className="text-gray-400">vs</span>{" "}
                        {game.away}
                      </span>

                      {/* 경기장 */}
                      <span className="text-gray-500 text-sm">
                        {game.place}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 날짜별 그룹핑 함수 ---------- */
function groupByDate(matches: Match[]) {
  const grouped: Record<string, Match[]> = {};
  matches.forEach((m) => {
    if (!grouped[m.date]) grouped[m.date] = [];
    grouped[m.date].push(m);
  });
  return Object.entries(grouped); // [ [date, Match[]], ... ]
}

/* ---------- 날짜 포맷터 ---------- */
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${
    ["일", "월", "화", "수", "목", "금", "토"][d.getDay()]
  })`;
}
