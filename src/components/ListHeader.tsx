type ListHeaderProps = {
  title: string;
  count?: number;
  sortOptions?: string[];
  onSortChange?: (value: string) => void;
  buttonText?: string;
  onButtonClick?: () => void;
};

export default function ListHeader({
  title,
  count,
  sortOptions,
  onSortChange,
  buttonText,
  onButtonClick,
}: ListHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6 w-full border-b border-gray-200 pb-4">
      {/* 왼쪽: 총 개수 */}
      <p className="text-sm font-medium text-gray-600">
        {count !== undefined ? (
          <>
            총 {count}개의 {title}
          </>
        ) : (
          title
        )}
      </p>

      {/* 오른쪽: 정렬 + 등록 버튼 */}
      <div className="flex items-center gap-3 ml-auto">
        {sortOptions && sortOptions.length > 0 && (
          <select
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none"
            onChange={(e) => onSortChange?.(e.target.value)}
          >
            {sortOptions.map((option, idx) => (
              <option key={idx}>{option}</option>
            ))}
          </select>
        )}

        {buttonText && (
          <button
            onClick={onButtonClick}
            className="px-4 py-2 rounded-lg bg-[#8A2BE2] text-white hover:bg-[#6F00B6] text-sm"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
