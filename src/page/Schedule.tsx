import { useEffect, useMemo, useState, useTransition } from "react";
import { useMatchStore } from "../store/mathStore";
import { TEAMS } from "../constants/teams";
import { STADIUM_MAP } from "../constants/stadiums";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import type { Match } from "../types/match";
import { formatTabDate } from "../utils/format";

function getTeamLabel(value: string) {
  return TEAMS.find((t) => t.value === value)?.label ?? value;
}
function getStadiumLabel(value: string) {
  return STADIUM_MAP[value] ?? value;
}
export default function SchedulePage() {
  const { matches, dates, loading, fetchMatches } = useMatchStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchMatches(); // store에 캐시 있으면 자동 skip
  }, [fetchMatches]);

  const currentDate = dates[currentIndex];
  const todayMatches = useMemo(
    () => matches.filter((m: Match) => m.date === currentDate),
    [matches, currentDate]
  );
  const currentMonth = currentDate
    ? new Date(currentDate).getMonth() + 1
    : null;

  if (loading && matches.length === 0) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center text-gray-400">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">경기 일정</h1>
        <p className="text-gray-500 mb-6">
          티켓 예매와 모임 준비 전에 경기 일정을 확인해보세요.
        </p>

        {/* 월 헤더 + 슬라이드 네비 */}
        <div className="w-full bg-gray-100 border border-gray-200 py-4 mb-6 flex items-center justify-between rounded-md">
          <button
            onClick={() =>
              startTransition(() => setCurrentIndex((i) => Math.max(0, i - 1)))
            }
            disabled={currentIndex === 0 || isPending}
            className={`px-4 text-gray-500 hover:text-gray-700 disabled:opacity-40 ${
              isPending ? "cursor-wait opacity-60" : ""
            }`}
          >
            <AiOutlineLeft className="text-3xl" />
          </button>

          <span className="text-2xl font-bold text-gray-700">
            {currentMonth ? `${currentMonth}월` : ""}
          </span>

          <button
            onClick={() =>
              startTransition(() =>
                setCurrentIndex((i) => Math.min(dates.length - 1, i + 1))
              )
            }
            disabled={currentIndex === dates.length - 1 || isPending}
            className={`px-4 text-gray-500 hover:text-gray-700 disabled:opacity-40 ${
              isPending ? "cursor-wait opacity-60" : ""
            }`}
          >
            <AiOutlineRight className="text-3xl" />
          </button>
        </div>

        {/* 날짜 탭 */}
        <div className="grid grid-cols-8 gap-2 mb-6">
          {dates.map((date, idx) => (
            <button
              key={date}
              onClick={() => startTransition(() => setCurrentIndex(idx))}
              disabled={isPending}
              className={`w-full py-3 rounded-lg border text-sm font-medium transition ${
                idx === currentIndex
                  ? "bg-[#6F00B6] text-white border-[#6F00B6]"
                  : "bg-white text-gray-600 border-gray-300"
              } ${isPending ? "cursor-wait opacity-80" : ""}`}
            >
              {formatTabDate(date)}
            </button>
          ))}
        </div>

        {/* 경기 리스트 */}
        {todayMatches.length === 0 ? (
          <p className="text-gray-500 px-2">등록된 경기 일정이 없습니다.</p>
        ) : (
          <ul className="border border-gray-200 rounded-b-lg divide-y divide-gray-200">
            {todayMatches.map((game) => (
              <li
                key={`${game.date}-${game.home}-${game.away}`}
                className="flex justify-between items-center px-6 py-5 hover:bg-gray-50 transition"
              >
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-lg text-gray-800">
                    {getTeamLabel(game.home)}
                  </span>
                  <span className="text-gray-400 text-base">vs</span>
                  <span className="font-bold text-lg text-gray-800">
                    {getTeamLabel(game.away)}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#6F00B6]/10 text-[#6F00B6]">
                  {getStadiumLabel(game.place)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* 안내 문구 */}
        <div className="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm font-semibold text-gray-600">경기 일정 안내</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            본 서비스에서 제공하는 경기 정보는 구단 및 공식 제공처의 데이터에
            따라 업데이트됩니다. <br />
            일부 경기 일정은 변경되거나 지연 반영될 수 있으니, 최신 정보는 각
            구단의 공식 채널을 함께 확인해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
