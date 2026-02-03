import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useToastStore } from "../../store/toastStore";
import ConfirmModal from "../../Modals/ConfirmModal";
import UserAvatar from "../common/UserAvatar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

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
  const api = useApi();

  // 구매자 목록 불러오기
  useEffect(() => {
    if (!isOpen) return;

    const preloadBuyerImages = async () => {
      try {
        const res = await api.get<{ status: string; data: Buyer[] }>(
          `/api/tickets/buyer/${tsId}`,
          { key: `ticket-buyers-${tsId}` }
        );
        if (res?.status === "success" && Array.isArray(res.data)) {
          const buyersData = res.data;

          // 이미지 미리 병렬로 가져오기
          const withImages = await Promise.all(
            buyersData.map(async (b: Buyer) => {
              try {
                const data = await api.get<{ status: string; data: string }>(
                  `/api/images/U/${b.userId}`,
                  { key: `buyer-image-${b.userId}` }
                );
                if (data.status === "success" && data.data) {
                  const resolvedUrl = data.data.startsWith("http")
                    ? data.data
                    : `${API_URL}/images/${data.data.replace(/^\/+/, "")}`;
                  return { ...b, imageUrl: resolvedUrl };
                }
                return { ...b, imageUrl: null };
              } catch {
                return { ...b, imageUrl: null };
              }
            })
          );
          setBuyers(withImages);
        } else {
          setBuyers([]);
        }
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        addToast("구매자 목록을 불러오지 못했습니다.", "error");
      }
    };

    preloadBuyerImages();
  }, [isOpen, tsId]);

  // 거래 완료 확정 (구매자 선택 후)
  const handleConfirm = async () => {
    if (!selectedBuyer) {
      addToast("구매자를 선택해주세요.", "error");
      return;
    }

    setIsLoading(true);
    try {
      // 구매자 지정
      const selectRes = await api.put<{ status: string; message?: string }>(
        `/api/tickets/select/${tsId}?buyerId=${selectedBuyer}`,
        undefined,
        { key: `ticket-select-buyer-${tsId}` }
      );
      if (selectRes?.status !== "success") {
        addToast(selectRes?.message || "구매자 지정 실패", "error");
        setIsLoading(false);
        return;
      }

      // 상태 변경 (판매 완료)
      const stateRes = await api.put<{ status: string; message?: string }>(
        `/api/tickets/state/${tsId}`,
        { state: "END" },
        { key: `ticket-complete-${tsId}` }
      );
      if (stateRes?.status === "success") {
        addToast("거래가 완료되었습니다.", "success");
        onSuccess();
        onClose();
      } else {
        addToast(stateRes?.message || "거래 완료 처리 실패", "error");
      }
    } catch (err: any) {
      if (err?.name === "CanceledError") return;
      addToast("서버 오류가 발생했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
                onClick={() => setSelectedBuyer(b.userId)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg border transition ${
                  selectedBuyer === b.userId
                    ? "border-[#6F00B6] bg-[#f7f3fb]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <UserAvatar
                  imageUrl={b.imageUrl}
                  nickname={b.nickname}
                  size={40}
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
