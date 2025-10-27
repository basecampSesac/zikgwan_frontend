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

  const handleToggle = () => {
    setOpenSelectId(isOpen ? null : id);
  };

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
            isOpen
              ? "border-[#6F00B6] ring-1 ring-[#6F00B6]"
              : "border-gray-200"
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

// DatePicker 버튼
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

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const filters = { keyword, team, stadium, date };
      onFilterChange?.(filters);
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
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
      const filters = { keyword, team, stadium, date };
      onFilterChange?.(filters);
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
      className="bg-gray-50 rounded-lg p-6 border border-gray-100"
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>

      {/* 검색어 입력 */}
      <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-2 mb-4">
        <Search size={18} className="text-gray-400 mr-2" />
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
          className="w-full outline-none text-sm text-gray-700 placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-end gap-4">
        {/* 구단 선택 */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium text-gray-600 mb-1">구단</label>
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

        {/* 날짜 선택 */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium text-gray-600 mb-1">날짜</label>
          <ReactDatePicker
            locale={ko}
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setDate(date ? format(date, "yyyy-MM-dd") : "");
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
            renderCustomHeader={({
              date,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) => (
              <div className="flex items-center justify-center gap-2 px-2 py-1">
                <button
                  onClick={decreaseMonth}
                  disabled={prevMonthButtonDisabled}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ◀
                </button>
                <span className="text-sm font-medium">
                  {format(date, "yyyy년 MM월")}
                </span>
                <button
                  onClick={increaseMonth}
                  disabled={nextMonthButtonDisabled}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ▶
                </button>
              </div>
            )}
          />
        </div>

        {/* 경기장 선택 */}
        <div className="flex flex-col flex-1">
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

        {/* 검색/전체보기 버튼 */}
        <div className="flex flex-col w-40">
          <label className="text-sm font-medium text-transparent mb-1">
            검색
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange?.({ keyword, team, stadium, date })}
              className="flex-1 h-10 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors rounded-md"
            >
              <Search size={16} />
              <span className="text-sm font-semibold">검색</span>
            </button>
            <button
              onClick={handleReset}
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
