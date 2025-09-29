// src/components/SearchPanel.tsx
import { Search, ChevronDown } from "lucide-react";

interface SearchPanelProps {
  title: string;
  showPrice?: boolean; // 가격대 필터 표시 여부
}

export default function SearchPanel({
  title,
  showPrice = true,
}: SearchPanelProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
      {/* 제목 */}
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>

      {/* 검색어 입력 */}
      <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-2 mb-4">
        <Search size={18} className="text-gray-400 mr-2 " />
        <input
          type="text"
          placeholder="경기, 팀명, 경기장으로 검색"
          className="w-full outline-none text-sm text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* 필터 + 검색 버튼 */}
      <div className="flex items-end gap-4">
        {/* 구단 */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium text-gray-600 mb-1">구단</label>
          <div className="relative w-full">
            <select className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm bg-white focus:outline-none appearance-none pr-8">
              <option>전체</option>
              <option>LG 트윈스</option>
              <option>두산 베어스</option>
              <option>KIA 타이거즈</option>
              <option>NC 다이노스</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* 날짜 */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium text-gray-600 mb-1">날짜</label>
          <input
            type="date"
            className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm bg-white focus:outline-none text-gray-700"
          />
        </div>

        {/* 경기장 */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium text-gray-600 mb-1">
            경기장
          </label>
          <div className="relative w-full">
            <select className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm bg-white focus:outline-none appearance-none pr-8">
              <option>전체</option>
              <option>잠실야구장</option>
              <option>광주-기아 챔피언스필드</option>
              <option>사직야구장</option>
              <option>대구 라이온즈 파크</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* 가격대 (옵션) */}
        {showPrice && (
          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium text-gray-600 mb-1">
              가격대
            </label>
            <div className="relative w-full">
              <select className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm bg-white focus:outline-none appearance-none pr-8">
                <option>전체</option>
                <option>~ 10,000원</option>
                <option>10,000원 ~ 30,000원</option>
                <option>30,000원 ~ 50,000원</option>
                <option>50,000원 이상</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* 검색 버튼 */}
        <div className="flex flex-col w-32">
          <label className="text-sm font-medium text-transparent mb-1">
            검색
          </label>
          <button className="w-full h-10 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors rounded-md">
            <Search size={16} />
            <span className="text-sm font-semibold">검색</span>
          </button>
        </div>
      </div>
    </div>
  );
}
