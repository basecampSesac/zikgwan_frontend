import { useEffect, useMemo, useState, useTransition } from "react";
import { useMatchStore } from "../store/matchStore";
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
  const [windowStart, setWindowStart] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // 오늘 날짜
  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  // 날짜 정렬
  const sortedDates = useMemo(() => {
    return [...new Set(dates)].sort();
  }, [dates]);

  // 오늘 날짜 찾기
  useEffect(() => {
    if (sortedDates.length === 0) return;

    let todayIdx = sortedDates.indexOf(todayStr);

    // 오늘 날짜가 없으면 오늘을 배열에 추가하고 정렬
    if (todayIdx === -1) {
      const extended = [...sortedDates, todayStr].sort();
      todayIdx = extended.indexOf(todayStr);

      // 중앙 정렬 (오늘 기준)
      setCurrentIndex(todayIdx);
      setWindowStart(Math.max(0, todayIdx - 4));
    } else {
      setCurrentIndex(todayIdx);
      setWindowStart(Math.max(0, todayIdx - 4));
    }
  }, [sortedDates, todayStr]);

  const currentDate = sortedDates[currentIndex] || todayStr; // fallback
  const todayMatches = useMemo(
    () => matches.filter((m: Match) => m.date === currentDate),
    [matches, currentDate]
  );
  const currentMonth = new Date(currentDate).getMonth() + 1;

  const visibleDates = useMemo(() => {
    const slice = sortedDates.slice(windowStart, windowStart + 9);

    // 오늘 날짜가 범위 안에 없으면 중앙으로 이동
    if (!slice.includes(todayStr)) {
      const idx = sortedDates.indexOf(todayStr);
      if (idx !== -1) {
        const newStart = Math.max(0, idx - 4);
        return sortedDates.slice(newStart, newStart + 9);
      }
    }
    return slice;
  }, [sortedDates, todayStr, windowStart]);

  // 이동 핸들러
  const handlePrev = () => {
    startTransition(() => {
      if (currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
        if (currentIndex - 1 < windowStart) {
          setWindowStart((s) => Math.max(0, s - 1));
        }
      }
    });
  };

  const handleNext = () => {
    startTransition(() => {
      if (currentIndex < sortedDates.length - 1) {
        setCurrentIndex((i) => i + 1);
        if (currentIndex + 1 >= windowStart + 9) {
          setWindowStart((s) => Math.min(sortedDates.length - 9, s + 1));
        }
      }
    });
  };

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
        <p className="text-gray-500 mb-8">
          티켓 예매와 모임 준비 전에 경기 일정을 확인해보세요.
        </p>

        {/* 월 헤더 + 슬라이드 네비 */}
        <section className="mb-10">
          <div className="w-full bg-gray-100 border border-gray-200 py-4 mb-3 flex items-center justify-between rounded-md">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0 || isPending}
              className={`px-4 text-gray-500 hover:text-gray-700 disabled:opacity-40 ${
                isPending ? "cursor-wait opacity-60" : ""
              }`}
            >
              <AiOutlineLeft className="text-3xl" />
            </button>

            <span className="text-2xl font-bold text-gray-700">
              {currentMonth}월
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex === sortedDates.length - 1 || isPending}
              className={`px-4 text-gray-500 hover:text-gray-700 disabled:opacity-40 ${
                isPending ? "cursor-wait opacity-60" : ""
              }`}
            >
              <AiOutlineRight className="text-3xl" />
            </button>
          </div>

          {/* 날짜 탭 */}
          <div className="grid grid-cols-9 gap-2">
            {visibleDates.map((date) => {
              const idx = sortedDates.indexOf(date);
              return (
                <button
                  key={date}
                  onClick={() => startTransition(() => setCurrentIndex(idx))}
                  disabled={isPending}
                  className={`w-full py-3 rounded-lg border text-base font-medium transition ${
                    idx === currentIndex
                      ? "bg-[#6F00B6] text-white border-[#6F00B6]"
                      : "bg-white text-gray-600 border-gray-300"
                  } ${isPending ? "cursor-wait opacity-80" : ""}`}
                >
                  {formatTabDate(date)}
                </button>
              );
            })}
          </div>
        </section>

        {/* 경기 리스트 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden ">
          {todayMatches.length === 0 ? (
            <p className="text-gray-500 px-6 py-9 text-center text-base">
              등록된 경기 일정이 없습니다.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {todayMatches.map((game) => (
                <li
                  key={`${game.date}-${game.home}-${game.away}`}
                  className="flex justify-between items-center px-8 py-7 bg-white hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-6">
                    <span className="font-bold text-[20px] text-gray-900">
                      {getTeamLabel(game.home)}
                    </span>
                    <span className="text-[18px] text-gray-500">vs</span>
                    <span className="font-bold text-[20px] text-gray-900">
                      {getTeamLabel(game.away)}
                    </span>
                  </div>
                  <span className="px-5 py-2 rounded-full text-[16px] font-semibold bg-[#6F00B6]/10 text-[#6F00B6]">
                    {getStadiumLabel(game.place)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* 안내 문구 */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-5 text-center">
            <p className="text-sm font-semibold text-gray-600">
              경기 일정 안내
            </p>
            <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
              본 서비스에서 제공하는 경기 정보는 구단 및 공식 제공처의 데이터에
              따라 업데이트됩니다. <br />
              일부 경기 일정은 변경되거나 지연 반영될 수 있으니, 최신 정보는 각
              구단의 공식 채널을 함께 확인해 주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
