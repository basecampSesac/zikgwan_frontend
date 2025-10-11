import { Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../lib/axiosInstance";
import { STADIUMS } from "../constants/stadiums";
import { FiChevronDown } from "react-icons/fi";
import ReactDatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import type { CommunityItem, GroupUI } from "../types/group";

interface SearchPanelProps {
  title: string;
  onSearch?: (results: GroupUI[]) => void;
  onReset?: () => void; //
}

export default function SearchPanel({
  title,
  onSearch,
  onReset,
}: SearchPanelProps) {
  const [keyword, setKeyword] = useState("");
  const [team, setTeam] = useState("");
  const [stadium, setStadium] = useState("");
  const [date, setDate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleKeywordSearch = useCallback(async () => {
    try {
      if (!keyword.trim()) {
        // 검색어가 없으면 전체 모임 불러오기
        const res = await axiosInstance.get("/api/communities");
        if (res.data.status === "success") {
          const mapped: GroupUI[] = res.data.data.map((g: CommunityItem) => ({
            id: g.communityId,
            title: g.title,
            content: g.description,
            date: g.date,
            stadiumName: g.stadium,
            teams: `${g.home} vs ${g.away}`,
            personnel: g.memberCount,
            leader: g.nickname,
            status: g.state === "ING" ? "모집중" : "모집마감",
          }));
          onSearch?.(mapped);
        }
        return;
      }

      // 검색어가 있을 경우
      const res = await axiosInstance.get<{
        status: string;
        data: CommunityItem[];
      }>("/api/communities/search", { params: { title: keyword } });

      if (res.data.status === "success") {
        const mapped: GroupUI[] = res.data.data.map((g) => ({
          id: g.communityId,
          title: g.title,
          content: g.description,
          date: g.date,
          stadiumName: g.stadium,
          teams: `${g.home} vs ${g.away}`,
          personnel: g.memberCount,
          leader: g.nickname,
          status: g.state === "ING" ? "모집중" : "모집마감",
        }));
        onSearch?.(mapped);
      }
    } catch (err) {
      console.error("검색 실패:", err);
    }
  }, [keyword, onSearch]);

  const handleSearch = useCallback(async () => {
    try {
      const noFilter = !keyword && !team && !stadium && !date;
      const endpoint = noFilter
        ? "/api/communities"
        : "/api/communities/search";

      const params: Record<string, string> = {};
      if (keyword.trim()) params.title = keyword.trim();
      if (team) params.team = team;
      if (stadium) params.stadium = stadium;
      if (date) params.date = date;
      console.log("검색 요청 params:", params);
      const res = await axiosInstance.get<{
        status: string;
        data: CommunityItem[];
      }>(endpoint, noFilter ? undefined : { params });

      if (res.data.status === "success") {
        const mapped: GroupUI[] = res.data.data.map((g) => ({
          id: g.communityId,
          title: g.title,
          content: g.description,
          date: g.date,
          stadiumName: g.stadium,
          teams: `${g.home} vs ${g.away}`,
          personnel: g.memberCount,
          leader: g.nickname,
          status: g.state === "ING" ? "모집중" : "모집마감",
        }));
        onSearch?.(mapped);
      }
    } catch (err) {
      console.error("검색 실패:", err);
    }
  }, [keyword, team, stadium, date, onSearch]);

  // 유저가 입력 시 자동 검색
  useEffect(() => {
    const delay = setTimeout(() => {
      handleKeywordSearch();
    }, 400); // 0.4초 동안 입력 없으면 자동 검색

    return () => clearTimeout(delay);
  }, [handleKeywordSearch]);

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>

      {/* 검색어 입력 */}
      <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-2 mb-4">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="경기, 팀명, 경기장으로 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full outline-none text-sm text-gray-700 placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-end gap-4">
        {/* 구단 */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium text-gray-600 mb-1">구단</label>
          <div className="relative">
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full h-10 border border-gray-200 rounded-md px-3 pr-10 text-sm bg-white focus:outline-none appearance-none"
            >
              <option value="">전체</option>
              <option value="LG">LG 트윈스</option>
              <option value="두산">두산 베어스</option>
              <option value="KIA">KIA 타이거즈</option>
              <option value="NC">NC 다이노스</option>
              <option value="삼성">삼성 라이온즈</option>
              <option value="SSG">SSG 랜더스</option>
              <option value="한화">한화 이글스</option>
              <option value="KT">KT 위즈</option>
              <option value="롯데">롯데 자이언츠</option>
              <option value="키움">키움 히어로즈</option>
            </select>

            <FiChevronDown
              size={18}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* 날짜 */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium text-gray-600 mb-1">날짜</label>
          <div className="relative">
            <ReactDatePicker
              locale={ko}
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setDate(date ? format(date, "yyyy-MM-dd") : "");
              }}
              placeholderText="날짜를 선택하세요"
              dateFormat="yyyy-MM-dd"
              className="w-full h-10 border border-gray-200 rounded-md px-3 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#6F00B6]"
            />
          </div>
        </div>

        {/* 경기장 */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium text-gray-600 mb-1">
            경기장
          </label>
          <div className="relative">
            <select
              value={stadium}
              onChange={(e) => setStadium(e.target.value)}
              className="w-full h-10 border border-gray-200 rounded-md px-3 pr-10 text-sm bg-white focus:outline-none appearance-none"
            >
              <option value="">전체</option>
              {STADIUMS.map((stadiumName) => (
                <option key={stadiumName} value={stadiumName}>
                  {stadiumName}
                </option>
              ))}
            </select>

            <FiChevronDown
              size={18}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* 검색 + 전체보기 버튼 영역 */}
        <div className="flex flex-col w-40">
          <label className="text-sm font-medium text-transparent mb-1">
            검색
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 h-10 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors rounded-md"
            >
              <Search size={16} />
              <span className="text-sm font-semibold">검색</span>
            </button>
            <button
              onClick={() => {
                setKeyword("");
                setTeam("");
                setStadium("");
                setDate("");
                onReset?.();
                setSelectedDate(null);
              }}
              className="flex-1 h-10 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors rounded-md"
            >
              <span className="text-sm font-semibold">전체</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
