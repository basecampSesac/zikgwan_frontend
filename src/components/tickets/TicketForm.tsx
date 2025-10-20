import { useState } from "react";
import { Upload } from "lucide-react";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { TEAMS } from "../../constants/teams";
import { STADIUMS } from "../../constants/stadiums";
import { useToastStore } from "../../store/toastStore";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../../lib/axiosInstance";

interface TicketFormProps {
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

  const [form, setForm] = useState({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    price: initialValues?.price?.toString() || "",
    ticketCount: initialValues?.ticketCount?.toString() || "",
    home: initialValues?.home || "",
    away: initialValues?.away || "",
    stadium: initialValues?.stadium || "",
    adjacentSeat: initialValues?.adjacentSeat === "Y",
  });

  const [gameDay, setGameDay] = useState<Date | null>(
    initialValues?.gameDay ? new Date(initialValues.gameDay) : null
  );
  const [images, setImages] = useState<File[]>([]);
  const [existingImage, setExistingImage] = useState<string | null>(
    initialValues?.imageUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inputKey, setInputKey] = useState<number>(Date.now());

  /** 입력 변경 핸들러 */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  /** 체크박스 */
  const handleCheckbox = () => {
    setForm({ ...form, adjacentSeat: !form.adjacentSeat });
  };

  /** 파일 업로드 */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(Array.from(e.target.files));
  };

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
      gameDay: gameDay.toISOString().slice(0, 19),
      ticketCount: Number(form.ticketCount),
      home: form.home,
      away: form.away,
      stadium: form.stadium,
      adjacentSeat: form.adjacentSeat ? "Y" : "N",
      buyerId: user.userId,
      state: initialValues?.state || "ING", // ✅ 수정 시 기존 상태 유지
    };

    try {
      const formData = new FormData();
      formData.append(
        "ticketSaleRequest",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );

      if (images.length > 0) {
        images.forEach((file) => formData.append("image", file));
      } else (existingImage && mode === "edit") 

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

        if (res.data.status === "success" && res.data.data) {
          const tsId = res.data.data.tsId;
          // 채팅방 생성
          await axiosInstance.post(
            `/api/chatroom/ticket/${tsId}?roomName=${encodeURIComponent(
              form.title
            )}`
          );
        }
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
      console.error("티켓 저장 오류:", err);
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
        {/* 제목 */}
        <label className="block">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            판매글 제목*
          </span>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="예: LG vs 두산, 1루 내야석 양도"
            className="input-border"
          />
        </label>

        {/* 경기 일자 */}
        <label className="block">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            경기 일자*
          </span>
          <DatePicker
            selected={gameDay}
            onChange={(date) => setGameDay(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            dateFormat="yyyy-MM-dd HH:mm"
            locale={ko}
            placeholderText="날짜와 시간을 선택하세요"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#6F00B6] focus:border-[#6F00B6]"
          />
        </label>

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

        {/* 홈/어웨이 */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1 text-gray-600">
              홈팀*
            </span>
            <select
              name="home"
              value={form.home}
              onChange={handleChange}
              className="input-border"
            >
              <option value="">선택</option>
              {TEAMS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1 text-gray-600">
              원정팀*
            </span>
            <select
              name="away"
              value={form.away}
              onChange={handleChange}
              className="input-border"
            >
              <option value="">선택</option>
              {TEAMS.map((t) => (
                <option
                  key={t.value}
                  value={t.value}
                  disabled={form.home === t.value}
                >
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* 구장 + 연석 여부 */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1 text-gray-600">
              야구장*
            </span>
            <select
              name="stadium"
              value={form.stadium}
              onChange={handleChange}
              className="input-border"
            >
              <option value="">선택</option>
              {STADIUMS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={form.adjacentSeat}
              onChange={handleCheckbox}
              className="accent-[#6F00B6]"
            />
            <span className="text-sm text-gray-600">연석 여부</span>
          </label>
        </div>

        {/* 상세 설명 */}
        <label className="block">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            상세 설명
          </span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="좌석 위치, 전달 방법 등 추가 설명을 입력해주세요."
            className="input-border h-24"
          />
        </label>

 {/* 이미지 업로드 (미리보기 + 삭제 가능) */}
<label className="block">
  <span className="block text-sm font-medium mb-1 text-gray-600">
    이미지 업로드 (선택)
  </span>

  <label
    htmlFor="imageInput"
    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-28 hover:bg-gray-50 overflow-hidden relative cursor-pointer"
  >
    {images.length > 0 ? (
      <div className="relative h-full aspect-[4/3]">
        <img
          src={URL.createObjectURL(images[0])}
          alt="preview"
          className="h-full w-auto object-cover rounded-md pointer-events-none"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setImages([]); // 업로드된 새 이미지 제거
            setInputKey(Date.now()); // input 초기화
          }}
          className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-10"
        >
          ×
        </button>
      </div>
    ) : existingImage ? (
      <div className="relative h-full aspect-[4/3]">
        <img
          src={existingImage}
          alt="preview"
          className="h-full w-auto object-cover rounded-md pointer-events-none"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExistingImage(null); // 기존 이미지 제거
            setInputKey(Date.now());
          }}
          className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-10"
        >
          ×
        </button>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center text-gray-400 h-full">
        <Upload className="w-6 h-6" />
        <span className="text-xs text-gray-500">클릭하여 이미지 선택</span>
      </div>
    )}
  </label>

  <input
    key={inputKey}
    id="imageInput"
    type="file"
    accept="image/*"
    onChange={(e) => {
      if (e.target.files) setImages(Array.from(e.target.files));
    }}
    className="hidden"
  />
</label>
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
