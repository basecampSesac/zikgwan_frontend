import { useState } from "react";
import { Star } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  sellerRating?: number;
  onSubmit: (rating: number) => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  sellerName,
  sellerRating = 0,
  onSubmit,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0) return alert("별점을 선택해주세요!");
    onSubmit(rating);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-[400px] rounded-2xl p-8 shadow-xl">
        {/* 제목 */}
        <h2 className="text-xl font-bold text-center mb-2">
          판매자와의 거래, 어땠나요?
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          별점을 남기면 서로가 더 믿고 거래할 수 있어요.
        </p>

        {/* 판매자 정보 + 별점 선택 */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex flex-col items-start">
              <p className="font-semibold">{sellerName}</p>
              <p className="text-sm text-gray-500">
                ★ {sellerRating.toFixed(1)}
              </p>
            </div>
          </div>

          {/* 별점 선택 */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer transition-colors ${
                  star <= (hover || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              />
            ))}
            <span className="ml-2 text-gray-500 text-lg">
              {rating > 0 ? `${rating}/5` : "0/5"}
            </span>
          </div>
        </div>

        {/* 버튼 영역 - 중앙정렬 */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition"
          >
            취소하기
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              rating === 0
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-[#6F00B6] text-white hover:bg-[#8A2BE2]"
            }`}
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
