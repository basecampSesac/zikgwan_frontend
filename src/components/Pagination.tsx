import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (pageNum: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-12 gap-3 text-sm">
      {/* 이전 버튼 */}
      <button
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className={`flex items-center justify-center px-3 py-2 rounded-md transition-all duration-150 ${
          page === 0
            ? "text-gray-300 bg-gray-50 cursor-not-allowed"
            : "text-gray-500 bg-white hover:bg-gray-100"
        }`}
      >
        <AiOutlineLeft size={18} />
      </button>

      {/* 페이지 번호 */}
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-4 py-2 rounded-md font-medium transition-all duration-150 ${
            page === i
              ? "bg-gray-200 text-gray-800"
              : "text-gray-600 bg-white hover:bg-gray-100"
          }`}
        >
          {i + 1}
        </button>
      ))}

      {/* 다음 버튼 */}
      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page === totalPages - 1}
        className={`flex items-center justify-center px-3 py-2 rounded-md transition-all duration-150 ${
          page === totalPages - 1
            ? "text-gray-300 bg-gray-50 cursor-not-allowed"
            : "text-gray-500 bg-white hover:bg-gray-100"
        }`}
      >
        <AiOutlineRight size={18} />
      </button>
    </div>
  );
}
