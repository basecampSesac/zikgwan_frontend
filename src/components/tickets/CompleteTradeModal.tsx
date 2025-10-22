import { useState, useEffect } from "react";
import axiosInstance from "../../lib/axiosInstance";
import { useToastStore } from "../../store/toastStore";
import ConfirmModal from "../../Modals/ConfirmModal";

interface CompleteTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tsId: number;
  onSuccess: () => void;
}

interface Buyer {
  userId: number;
  nickname: string;
  imageUrl: string | null;
}

export default function CompleteTradeModal({
  isOpen,
  onClose,
  tsId,
  onSuccess,
}: CompleteTradeModalProps) {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  // 구매자 목록 불러오기
  useEffect(() => {
    if (!isOpen) return;
    const fetchBuyers = async () => {
      try {
        const res = await axiosInstance.get("/api/tickets/buyer");

        if (res.data?.status === "success" && Array.isArray(res.data.data)) {
          setBuyers(res.data.data);
        } else {
          console.warn("⚠️ [fetchBuyers] 데이터 형식 이상:", res.data);
          setBuyers([]);
        }
      } catch (err) {
        console.error("🚨 [fetchBuyers] 구매자 목록 조회 실패:", err);
        addToast("구매자 목록을 불러오지 못했습니다.", "error");
      }
    };
    fetchBuyers();
  }, [isOpen, addToast]);

  // 거래 완료 확정 (구매자 선택 후)
  const handleConfirm = async () => {
    if (!selectedBuyer) {
      addToast("구매자를 선택해주세요.", "error");
      return;
    }

    setIsLoading(true);
    try {
      // 구매자 지정
      console.log("🚀 [PUT] /api/tickets/select 요청 시작:", {
        tsId,
        buyerId: selectedBuyer,
      });

      const selectRes = await axiosInstance.put(
        `/api/tickets/select/${tsId}?buyerId=${selectedBuyer}`
      );

      if (selectRes.data?.status !== "success") {
        addToast(selectRes.data?.message || "구매자 지정 실패", "error");
        setIsLoading(false);
        return;
      }

      // 상태 변경 (판매 완료)
      console.log("🚀 [PUT] /api/tickets/state 요청 시작:", tsId);
      const stateRes = await axiosInstance.put(`/api/tickets/state/${tsId}`, {
        state: "END",
      });

      if (stateRes.data?.status === "success") {
        addToast("거래가 완료되었습니다.", "success");
        onSuccess();
        onClose();
      } else {
        addToast(stateRes.data?.message || "거래 완료 처리 실패", "error");
      }
    } catch (err) {
      console.error("🚨 [handleConfirm] 거래 완료 오류:", err);
      addToast("서버 오류가 발생했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {}, [buyers]);

  return (
    <ConfirmModal
      isOpen={isOpen}
      title="거래 완료 처리"
      description="실제 거래가 이루어진 구매자를 선택해주세요."
      confirmText={isLoading ? "처리 중..." : "완료하기"}
      cancelText="취소"
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <div className="mt-5">
        {buyers.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">
            현재 채팅 중인 구매자가 없습니다.
          </p>
        ) : (
          <div className="space-y-2">
            {buyers.map((b) => (
              <button
                key={b.userId}
                onClick={() => {
                  setSelectedBuyer(b.userId);
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg border transition ${
                  selectedBuyer === b.userId
                    ? "border-[#6F00B6] bg-[#f7f3fb]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={
                    b.imageUrl
                      ? `http://localhost:8080${b.imageUrl}`
                      : "/default-profile.png"
                  }
                  alt={b.nickname}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <span
                  className={`font-medium ${
                    selectedBuyer === b.userId
                      ? "text-[#6F00B6]"
                      : "text-gray-700"
                  }`}
                >
                  {b.nickname ?? "익명"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </ConfirmModal>
  );
}
