import { useState } from "react";
import { Star } from "lucide-react";
import { useToastStore } from "../store/toastStore";
import axiosInstance from "../lib/axiosInstance";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  sellerId: number;
  sellerImage?: string | null;
  sellerRating?: number;
  tsId: number;
  onSubmit: (rating: number) => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  sellerName,
  sellerImage,
  tsId,
  onSubmit,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const { addToast } = useToastStore();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      addToast("별점을 선택해주세요.", "warning");
      return;
    }

    try {
      const { data } = await axiosInstance.post(`/api/review/rating/${tsId}`, {
        rating,
      });

      if (data.status === "success") {
        addToast(data.data || "리뷰 등록 완료!", "success");
        onSubmit(rating);
        onClose();
      } else {
        addToast("리뷰 등록에 실패했습니다.", "error");
      }
    } catch (err) {
      console.error("🚨 리뷰 등록 실패:", err);
      addToast("리뷰 등록 중 오류가 발생했습니다.", "error");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-[400px] rounded-2xl p-8 shadow-xl">
        <h2 className="text-xl font-bold text-center mb-2">
          판매자와의 거래, 어땠나요?
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          별점을 남기면 서로가 더 믿고 거래할 수 있어요.
        </p>

        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-4">
            {sellerImage ? (
              <img
                src={sellerImage}
                alt={`${sellerName} 프로필`}
                className="w-12 h-12 rounded-full object-cover border border-gray-200 transition-opacity duration-300 opacity-100"
                onError={(e) => (e.currentTarget.src = "/default-profile.png")}
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
            )}
            <div className="flex flex-col items-start">
              <p className="font-semibold">{sellerName}</p>
            </div>
          </div>

          {/* 별점 선택 */}
          <div className="flex items-center gap-1 mb-2 select-none">
            {[1, 2, 3, 4, 5].map((star) => {
              const displayValue = hover || rating;
              const full = displayValue >= star;
              const half = displayValue + 0.5 === star;

              return (
                <div
                  key={star}
                  className="relative w-8 h-8 cursor-pointer"
                  onMouseLeave={() => setHover(0)}
                >
                  <div
                    className="absolute left-0 top-0 w-1/2 h-full z-10"
                    onMouseEnter={() => setHover(star - 0.5)}
                    onClick={() => setRating(star - 0.5)}
                  />
                  <div
                    className="absolute right-0 top-0 w-1/2 h-full z-10"
                    onMouseEnter={() => setHover(star)}
                    onClick={() => setRating(star)}
                  />
                  <Star className="absolute inset-0 w-8 h-8 text-gray-300 fill-gray-300" />
                  {half && (
                    <Star
                      className="absolute inset-0 w-8 h-8 text-yellow-400 fill-yellow-400 transition-all duration-200"
                      style={{
                        maskImage:
                          "linear-gradient(to right, black 50%, transparent 50%)",
                        WebkitMaskImage:
                          "linear-gradient(to right, black 50%, transparent 50%)",
                      }}
                    />
                  )}
                  {full && (
                    <Star className="absolute inset-0 w-8 h-8 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
              );
            })}

            <span className="ml-2 text-gray-500 text-lg min-w-[50px] text-center">
              {rating > 0 ? `${rating.toFixed(1)}/5.0` : "0/5.0"}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setRating(0);
              setHover(0);
              onClose();
            }}
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
