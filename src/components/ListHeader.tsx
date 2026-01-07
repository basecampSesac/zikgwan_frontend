import { FiChevronDown } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";

type ListHeaderProps = {
  title: string;
  count?: number;
  sortOptions?: string[];
  onSortChange?: (value: string) => void;
  buttonText?: string;
  onButtonClick?: () => void;
  externalRef?: React.RefObject<HTMLElement>;
};

export default function ListHeader({
  title,
  count,
  sortOptions,
  onSortChange,
  buttonText,
  onButtonClick,
  externalRef,
}: ListHeaderProps) {
  const [selectedSort, setSelectedSort] = useState(sortOptions?.[0] || "");
  const [openSelectId, setOpenSelectId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    onSortChange?.(value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
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
      ref={containerRef}
      className="
      w-full border-b border-gray-200 pb-3 sm:pb-4 mb-4 sm:mb-6
      flex items-center gap-2 sm:gap-3
      flex-nowrap
    "
    >
      <p
        className="
        min-w-0 flex-1
        text-xs sm:text-sm font-medium text-gray-600
        truncate
      "
        title={count !== undefined ? `총 ${count}개의 ${title}` : title}
      >
        {count !== undefined ? (
          <>
            총 {count}개의 {title}
          </>
        ) : (
          title
        )}
      </p>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {sortOptions && sortOptions.length > 0 && (
          <CustomSelect
            id="list-header-sort"
            options={sortOptions.map((s) => ({ label: s, value: s }))}
            value={selectedSort}
            onChange={handleSortChange}
            openSelectId={openSelectId}
            setOpenSelectId={setOpenSelectId}
          />
        )}

        {buttonText && (
          <button
            onClick={onButtonClick}
            className="
            px-2.5 py-1.5 sm:px-4 sm:py-2
            rounded-lg bg-[#8A2BE2] text-white hover:bg-[#6F00B6]
            text-xs sm:text-sm
            whitespace-nowrap
            shrink-0
          "
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
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
    <div className="relative w-32 sm:w-40 custom-select">
      <button
        type="button"
        onClick={handleToggle}
        className={`
        w-full h-9 sm:h-10
        flex items-center justify-between
        px-2.5 sm:px-3
        text-xs sm:text-sm
        border rounded-md bg-white focus:outline-none
        ${isOpen ? "border-[#6F00B6] ring-1 ring-[#6F00B6]" : "border-gray-200"}
        transition-colors
      `}
      >
        <span
          className={`truncate ${
            !selectedLabel ? "text-gray-400" : "text-gray-700"
          }`}
        >
          {selectedLabel || placeholder}
        </span>
        <FiChevronDown size={16} className="text-gray-400 shrink-0" />
      </button>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md bg-white shadow-md">
          {options.map((o) => (
            <li
              key={o.value}
              className="px-2.5 py-2 text-xs sm:text-sm cursor-pointer rounded-md hover:bg-purple-50 hover:text-purple-700 transition-colors text-gray-700"
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
