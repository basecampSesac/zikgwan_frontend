import { useEffect, useMemo, useState, useTransition } from "react";
import { useMatchStore } from "../store/matchStore";
import { TEAMS } from "../constants/teams";
import { STADIUM_MAP } from "../constants/stadiums";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import type { Match } from "../types/match";
import { formatTabDate } from "../utils/format";
import { TEAM_LOGO_MAP } from "../constants/teamLogoMap";

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

  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const sortedDates = useMemo(() => {
    return [...new Set(dates)].sort();
  }, [dates]);

  useEffect(() => {
    if (sortedDates.length === 0) return;

    let todayIdx = sortedDates.indexOf(todayStr);

    if (todayIdx === -1) {
      const extended = [...sortedDates, todayStr].sort();
      todayIdx = extended.indexOf(todayStr);

      setCurrentIndex(todayIdx);
      setWindowStart(Math.max(0, todayIdx - 4));
    } else {
      setCurrentIndex(todayIdx);
      setWindowStart(Math.max(0, todayIdx - 4));
    }
  }, [sortedDates, todayStr]);

  const currentDate = sortedDates[currentIndex] || todayStr;
  const todayMatches = useMemo(
    () => matches.filter((m: Match) => m.date === currentDate),
    [matches, currentDate]
  );
  const currentMonth = new Date(currentDate).getMonth() + 1;

  const visibleDates = useMemo(() => {
    const slice = sortedDates.slice(windowStart, windowStart + 9);

    if (!slice.includes(todayStr)) {
      const idx = sortedDates.indexOf(todayStr);
      if (idx !== -1) {
        const newStart = Math.max(0, idx - 4);
        return sortedDates.slice(newStart, newStart + 9);
      }
    }
    return slice;
  }, [sortedDates, todayStr, windowStart]);

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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">경기 일정</h1>
        <p className="text-gray-500 mb-8">
          티켓 예매와 모임 준비 전에 경기 일정을 확인해보세요.
        </p>

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
          <div className="md:hidden -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {visibleDates.map((date) => {
                const idx = sortedDates.indexOf(date);
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={date}
                    onClick={() => startTransition(() => setCurrentIndex(idx))}
                    disabled={isPending}
                    className={`shrink-0 h-10 px-3 rounded-lg border text-sm font-medium transition whitespace-nowrap ${
                      isActive
                        ? "bg-[#6F00B6] text-white border-[#6F00B6]"
                        : "bg-white text-gray-600 border-gray-300"
                    } ${isPending ? "cursor-wait opacity-80" : ""}`}
                  >
                    {formatTabDate(date)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden md:grid grid-cols-9 gap-2">
            {visibleDates.map((date) => {
              const idx = sortedDates.indexOf(date);
              const isActive = idx === currentIndex;
              return (
                <button
                  key={date}
                  onClick={() => startTransition(() => setCurrentIndex(idx))}
                  disabled={isPending}
                  className={`w-full py-3 rounded-lg border text-base font-medium transition ${
                    isActive
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
                  <div className="flex items-center justify-start gap-x-6">
                    <div className="flex items-center gap-x-2 flex-shrink-0">
                      <span className="font-bold text-[23px] text-gray-900 whitespace-nowrap">
                        {getTeamLabel(game.home)}
                      </span>
                      <img
                        src={TEAM_LOGO_MAP[game.home]}
                        alt={game.home}
                        className="w-9 h-9 object-contain"
                      />
                    </div>
                    <span className="text-[18px] text-gray-500 font-medium text-center flex-shrink-0">
                      vs
                    </span>
                    <div className="flex items-center gap-x-2 flex-shrink-0">
                      <img
                        src={TEAM_LOGO_MAP[game.away]}
                        alt={game.away}
                        className="w-9 h-9 object-contain"
                      />
                      <span className="font-bold text-[23px] text-gray-900 whitespace-nowrap">
                        {getTeamLabel(game.away)}
                      </span>
                    </div>
                  </div>
                  <span className="px-5 py-2 rounded-full text-[16px] font-semibold bg-[#6F00B6]/10 text-[#6F00B6]">
                    {getStadiumLabel(game.place)}
                  </span>
                </li>
              ))}
            </ul>
          )}

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
