type ListHeaderProps = {
  title: string;
  count: number;
  onSortChange?: (value: string) => void;
  sortOptions?: string[];
  buttonText: string;
  onButtonClick?: () => void;
};

export default function ListHeader({
  title,
  count,
  onSortChange,
  sortOptions = ["최신순", "낮은 가격순", "높은 가격순"],
  buttonText,
  onButtonClick,
}: ListHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6 w-full border-b border-gray-200 pb-4">
      {/* 왼쪽: 총 개수 */}
      <p className="text-sm font-medium text-gray-600">
        총 {count}개의 {title}
      </p>

      {/* 오른쪽: 정렬 + 등록 버튼 */}
      <div className="flex items-center gap-3 ml-auto">
        <select
          className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none"
          onChange={(e) => onSortChange?.(e.target.value)}
        >
          {sortOptions.map((option, idx) => (
            <option key={idx}>{option}</option>
          ))}
        </select>

        <button
          onClick={onButtonClick}
          className="px-4 py-2 rounded-lg bg-[#8A2BE2] text-white hover:bg-[#6F00B6] text-sm"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
