import { useToastStore } from "../../store/toastStore";
import { useAuthStore } from "../../store/authStore";
import { getDefaultStadiumImage } from "../../constants/stadiums";
import axiosInstance from "../../lib/axiosInstance";
import { useTicketForm } from "../../hooks/useTicketForm";
import { TicketFormFields } from "./TicketFormFields";
import { logger } from "../../utils/logger";



export interface TicketFormProps {
  mode?: "create" | "edit";
  initialValues?: Partial<{
    tsId: number;
    title: string;
    description: string;
    price: number;
    ticketCount: number;
    home: string;
    away: string;
    stadium: string;
    adjacentSeat: string;
    gameDay: string;
    imageUrl: string; // 기존 이미지 URL
  }>;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function TicketForm({
  mode = "create",
  initialValues,
  onClose,
  onSuccess,
}: TicketFormProps) {
  const addToast = useToastStore((s) => s.addToast);
  const { user } = useAuthStore();

  const {
    form,
    gameDay,
    image,
    existingImageUrl,
    isSubmitting,
    inputKey,
    setGameDay,
    setImage,
    setExistingImageUrl,
    setIsSubmitting,
    handleChange,
    handleCheckbox,
    handleFile,
  } = useTicketForm(initialValues);

  /** 제출 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (
      !form.title ||
      !form.price ||
      !gameDay ||
      !form.ticketCount ||
      !form.home ||
      !form.away ||
      !form.stadium
    ) {
      addToast("필수 항목을 모두 입력해주세요 ❌", "error");
      return;
    }

    if (!user?.userId) {
      addToast("로그인이 필요합니다.", "error");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      gameDay: new Date(gameDay.getTime() - gameDay.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19),
      ticketCount: Number(form.ticketCount),
      home: form.home,
      away: form.away,
      stadium: form.stadium,
      adjacentSeat: form.adjacentSeat ? "Y" : "N",
      buyerId: user.userId,
      state: "ING",
    };

    try {
      const formData = new FormData();
      formData.append(
        "ticketSaleRequest",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );


     if (image) {
      formData.append("image", image);
    } else {
      try {
        const defaultImagePath = getDefaultStadiumImage(form.stadium);
        const response = await fetch(defaultImagePath);
        const blob = await response.blob();
        formData.append("image", blob, "default.jpg");
      } catch {
        formData.append("image", "null");
      }
    }

    setIsSubmitting(true);

      let res;
      if (mode === "edit" && initialValues?.tsId) {
        // 수정 모드: PUT 요청
        res = await axiosInstance.put(
          `/api/tickets/${initialValues.tsId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        // 생성 모드: POST 요청
        res = await axiosInstance.post(`/api/tickets`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data.status === "success") {
        addToast(
          mode === "edit"
            ? "티켓이 수정되었습니다 ✅"
            : "티켓이 등록되었습니다 🎉",
          "success"
        );
        onSuccess?.();
        onClose?.();
      } else {
        addToast(res.data.message || "저장 실패 ❌", "error");
      }
} catch (err) {
      logger.error("티켓 저장 오류", err, {
        mode,
        stadium: form.stadium,
        home: form.home,
        away: form.away,
      });
      addToast("서버 오류가 발생했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

return (
    <div className="flex flex-col w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === "create" ? "티켓 등록" : "티켓 수정"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <TicketFormFields
          form={form}
          gameDay={gameDay}
          image={image}
          existingImageUrl={existingImageUrl}
          inputKey={inputKey}
          setGameDay={setGameDay}
          setImage={setImage}
          setExistingImageUrl={setExistingImageUrl}
          handleChange={handleChange}
          handleCheckbox={handleCheckbox}
          handleFile={handleFile}
          disabled={isSubmitting}
        />

        {/* 가격 + 매수 */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1 text-gray-600">
              티켓 가격*
            </span>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="예: 35000"
              className="input-border"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1 text-gray-600">
              티켓 매수*
            </span>
            <input
              type="number"
              name="ticketCount"
              value={form.ticketCount}
              onChange={handleChange}
              placeholder="예: 2"
              className="input-border"
            />
          </label>
        </div>


        {/* 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            isSubmitting
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#6F00B6] text-white hover:bg-[#8A2BE2]"
          }`}
        >
          {mode === "create" ? "등록하기" : "수정 완료"}
        </button>
      </form>
    </div>
  );
}
