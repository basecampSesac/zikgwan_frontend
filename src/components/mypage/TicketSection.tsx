import { useState } from "react";
import ReviewModal from "../../components/ReviewModal";
import axiosInstance from "../../lib/axiosInstance";

export default function TicketSection() {
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const handleReviewSubmit = async (rating: number) => {
    if (!selectedTicketId) return;

    try {
      const res = await axiosInstance.post(
        `/api/review/rating/${selectedTicketId}`,
        { rating }
      );
      console.log(res.data);
      alert(res.data.data || "리뷰 등록 완료!");
    } catch (err) {
      console.error("리뷰 등록 실패:", err);
      alert("리뷰 등록 중 오류가 발생했습니다.");
    } finally {
      setSelectedTicketId(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">내가 등록한 티켓</h2>
      <ul className="space-y-4">
        {[1, 2, 3].map((id) => (
          <li
            key={id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">테스트 티켓 {id}</p>
              <p className="text-sm text-gray-500">2025-10-10</p>
            </div>
            <button
              onClick={() => setSelectedTicketId(id)}
              className="px-3 py-1 rounded-lg bg-[#6F00B6] text-white text-sm hover:bg-[#57008f]"
            >
              거래 평가하기
            </button>
          </li>
        ))}
      </ul>

      {/* 리뷰 모달 */}
      <ReviewModal
        isOpen={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        sellerName="야구매니아"
        sellerRating={4.5}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
