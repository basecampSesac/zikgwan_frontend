import Modal from "./Modal";

type ListHeaderProps = {
  title: string; // "티켓" / "모임" 등 리스트명
  count: number; // 데이터 개수
  onSortChange?: (value: string) => void; // 정렬 변경 이벤트
  sortOptions?: string[]; // 정렬 옵션
  buttonText: string; // 등록 버튼 텍스트
  modalClasses?: string; // 버튼 스타일 (선택적)
};

export default function ListHeader({
  title,
  count,
  onSortChange,
  sortOptions = ["최신순", "낮은 가격순", "높은 가격순"],
  buttonText,
  modalClasses = "px-4 py-2 rounded-md bg-[#8A2BE2] text-white hover:bg-[#6F00B6] text-sm",
}: ListHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      {/* 총 개수 */}
      <p className="text-sm font-medium text-gray-600">
        총 {count}개의 {title}
      </p>

      {/* 정렬 + 등록 버튼 */}
      <div className="flex items-center gap-4">
        <select
          className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none"
          onChange={(e) => onSortChange?.(e.target.value)}
        >
          {sortOptions.map((option, idx) => (
            <option key={idx}>{option}</option>
          ))}
        </select>

        <Modal buttonText={buttonText} classes={modalClasses} />
      </div>
    </div>
  );
}
