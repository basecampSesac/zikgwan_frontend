import { Search } from "lucide-react";
import { useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import type { GroupUI } from "../types/group";
import { STADIUMS } from "../constants/stadiums";

interface SearchPanelProps {
  title: string;
  onSearch?: (results: GroupUI[]) => void;
}

interface CommunityItem {
  communityId: number;
  title: string;
  description: string;
  date: string;
  memberCount: number;
  stadium: string;
  home: string;
  away: string;
  nickname: string;
  state: "ING" | "DONE";
}

export default function SearchPanel({ title, onSearch }: SearchPanelProps) {
  const [keyword, setKeyword] = useState("");
  const [team, setTeam] = useState("");
  const [stadium, setStadium] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = async () => {
    try {
      const params: Record<string, string> = {};

      if (keyword.trim()) params.title = keyword.trim();
      if (team) params.team = team;
      if (stadium) params.stadium = stadium;
      if (date) params.date = date;

      const res = await axiosInstance.get<{
        status: string;
        data: CommunityItem[];
      }>("/api/communities/search", { params });

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
      } else {
        console.warn("검색 결과가 없습니다.");
      }
    } catch (err) {
      console.error("검색 실패:", err);
    }
  };

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
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm bg-white focus:outline-none"
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
          </select>
        </div>

        {/* 날짜 */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium text-gray-600 mb-1">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm bg-white focus:outline-none text-gray-700"
          />
        </div>

        {/* 경기장 */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium text-gray-600 mb-1">
            경기장
          </label>
          <select
            value={stadium}
            onChange={(e) => setStadium(e.target.value)}
            className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm bg-white focus:outline-none"
          >
            <option value="">전체</option>
            {STADIUMS.map((stadiumName) => (
              <option key={stadiumName} value={stadiumName}>
                {stadiumName}
              </option>
            ))}
          </select>
        </div>

        {/* 검색 버튼 */}
        <div className="flex flex-col w-32">
          <label className="text-sm font-medium text-transparent mb-1">
            검색
          </label>
          <button
            onClick={handleSearch}
            className="w-full h-10 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors rounded-md"
          >
            <Search size={16} />
            <span className="text-sm font-semibold">검색</span>
          </button>
        </div>
      </div>
    </div>
  );
}
