import { Search } from "lucide-react";
import { useState, useEffect, useRef, forwardRef } from "react";
import { STADIUMS } from "../constants/stadiums";
import { FiChevronDown } from "react-icons/fi";
import ReactDatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

interface SearchPanelProps {
  title: string;
  mode?: "group" | "ticket";
  onFilterChange?: (filters: {
    keyword: string;
    team: string;
    stadium: string;
    date: string;
  }) => void;
  onReset?: () => void;
  externalRef?: React.RefObject<HTMLElement>;
}

function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "전체",
  id,
  openSelectId,
  setOpenSelectId,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  id: string;
  openSelectId: string | null;
  setOpenSelectId: (id: string | null) => void;
}) {
  const isOpen = openSelectId === id;

  const handleToggle = () => setOpenSelectId(isOpen ? null : id);
  const handleSelect = (val: string) => {
    onChange(val);
    setOpenSelectId(null);
  };

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="relative w-full custom-select">
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full h-10 flex items-center justify-between px-3 text-sm border rounded-md bg-white focus:outline-none
        ${
          isOpen ? "border-[#6F00B6] ring-1 ring-[#6F00B6]" : "border-gray-200"
        } transition-colors`}
      >
        <span className={!selectedLabel ? "text-gray-400" : "text-gray-700"}>
          {selectedLabel || placeholder}
        </span>
        <FiChevronDown size={18} className="text-gray-400" />
      </button>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md bg-white shadow-md">
          {options.map((o) => (
            <li
              key={o.value}
              className="px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-purple-50 hover:text-purple-700 transition-colors text-gray-700"
              onClick={() => handleSelect(o.value)}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const CustomDateInput = forwardRef<
  HTMLButtonElement,
  {
    value?: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    placeholder?: string;
    setOpenSelectId?: (id: string | null) => void;
    isOpen?: boolean;
  }
>(({ value, onClick, placeholder, setOpenSelectId, isOpen }, ref) => (
  <button
    type="button"
    ref={ref}
    onClick={(e) => {
      e.stopPropagation();
      setOpenSelectId?.("date");
      onClick?.(e);
    }}
    className={`w-full h-10 text-left border rounded-md px-3 text-sm bg-white transition-colors
    ${isOpen ? "border-[#6F00B6] ring-1 ring-[#6F00B6]" : "border-gray-200"}`}
  >
    {value || <span className="text-gray-400">{placeholder}</span>}
  </button>
));
CustomDateInput.displayName = "CustomDateInput";

export default function SearchPanel({
  title,
  mode = "group",
  onFilterChange,
  onReset,
  externalRef,
}: SearchPanelProps) {
  const [keyword, setKeyword] = useState("");
  const [team, setTeam] = useState("");
  const [stadium, setStadium] = useState("");
  const [date, setDate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [openSelectId, setOpenSelectId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // ✅ 모바일에서 필터 접기/펼치기
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onFilterChange?.({ keyword, team, stadium, date });
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const handleReset = () => {
    const empty = { keyword: "", team: "", stadium: "", date: "" };
    setKeyword("");
    setTeam("");
    setStadium("");
    setDate("");
    setSelectedDate(null);
    onReset?.();
    onFilterChange?.(empty);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onFilterChange?.({ keyword, team, stadium, date });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !document.getElementById("search-panel-container")?.contains(target) &&
        !(externalRef?.current?.contains(target) ?? false)
      ) {
        setOpenSelectId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [externalRef]);

  return (
    <div
      id="search-panel-container"
      className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-100"
    >
      <h2 className="text-lg font-semibold mb-3 text-gray-700">{title}</h2>

      {/* 1행: md 미만 = 세로 / md 이상 = 가로 */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
        {/* 검색 인풋: 항상 패널 폭 꽉 */}
        <div className="w-full flex items-center bg-white border border-gray-200 rounded-md px-3 h-10">
          <Search size={18} className="text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              isFocused
                ? ""
                : mode === "group"
                ? "모임명, 팀명, 경기장으로 검색"
                : "티켓명, 경기, 구단명으로 검색"
            }
            className="w-full h-full outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
          />
        </div>

        {/* md 미만: 필터 토글도 w-full로 아래로 내려감 */}
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="md:hidden w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm font-semibold text-gray-700 flex items-center justify-between"
        >
          <span>필터</span>
          <span className="text-gray-400">{filtersOpen ? "▲" : "▼"}</span>
        </button>

        {/* md 이상: 오른쪽 버튼 */}
        <div className="hidden md:flex gap-2 shrink-0">
          <button
            onClick={() => onFilterChange?.({ keyword, team, stadium, date })}
            className="h-10 px-4 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors rounded-md"
          >
            <Search size={16} className="shrink-0" />
            <span className="text-sm font-semibold">검색</span>
          </button>
          <button
            onClick={handleReset}
            className="h-10 px-4 flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors rounded-md"
          >
            <span className="text-sm font-semibold">전체</span>
          </button>
        </div>
      </div>

      {/* 필터 영역: md 미만은 토글로 열고닫고, md 이상은 항상 보이게 */}
      <div className={`${filtersOpen ? "block" : "hidden"} md:block mt-4`}>
        {/* md 미만 = 전부 세로 / md 이상 = 가로 3등분 */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col w-full md:flex-1">
            <label className="text-sm font-medium text-gray-600 mb-1">
              구단
            </label>
            <CustomSelect
              id="team"
              options={[
                { label: "전체", value: "" },
                { label: "LG 트윈스", value: "LG" },
                { label: "두산 베어스", value: "두산" },
                { label: "KIA 타이거즈", value: "KIA" },
                { label: "NC 다이노스", value: "NC" },
                { label: "삼성 라이온즈", value: "삼성" },
                { label: "SSG 랜더스", value: "SSG" },
                { label: "한화 이글스", value: "한화" },
                { label: "KT 위즈", value: "KT" },
                { label: "롯데 자이언츠", value: "롯데" },
                { label: "키움 히어로즈", value: "키움" },
              ]}
              value={team}
              onChange={setTeam}
              openSelectId={openSelectId}
              setOpenSelectId={setOpenSelectId}
            />
          </div>

          <div className="flex flex-col w-full md:flex-1">
            <label className="text-sm font-medium text-gray-600 mb-1">
              날짜
            </label>
            <ReactDatePicker
              locale={ko}
              selected={selectedDate}
              onChange={(d) => {
                setSelectedDate(d);
                setDate(d ? format(d, "yyyy-MM-dd") : "");
                setOpenSelectId(null);
              }}
              placeholderText="날짜를 선택하세요"
              dateFormat="yyyy-MM-dd"
              isClearable
              customInput={
                <CustomDateInput
                  setOpenSelectId={setOpenSelectId}
                  isOpen={openSelectId === "date"}
                />
              }
            />
          </div>

          <div className="flex flex-col w-full md:flex-1">
            <label className="text-sm font-medium text-gray-600 mb-1">
              경기장
            </label>
            <CustomSelect
              id="stadium"
              options={[
                { label: "전체", value: "" },
                ...STADIUMS.map((s) => ({ label: s, value: s })),
              ]}
              value={stadium}
              onChange={setStadium}
              openSelectId={openSelectId}
              setOpenSelectId={setOpenSelectId}
            />
          </div>
        </div>

        {/* md 미만: 버튼도 아래로 쌓고 w-full */}
        <div className="md:hidden mt-4 flex flex-col gap-2">
          <button
            onClick={() => onFilterChange?.({ keyword, team, stadium, date })}
            className="w-full h-10 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors rounded-md"
          >
            <Search size={16} />
            <span className="text-sm font-semibold">검색</span>
          </button>
          <button
            onClick={handleReset}
            className="w-full h-10 flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors rounded-md"
          >
            <span className="text-sm font-semibold">전체</span>
          </button>
        </div>
      </div>
    </div>
  );
}
