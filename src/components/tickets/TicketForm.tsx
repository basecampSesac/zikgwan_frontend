import { useState } from "react";
import { Upload } from "lucide-react";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { TEAMS } from "../../constants/teams";
import { STADIUMS } from "../../constants/stadiums";
import { useToastStore } from "../../store/toastStore";
import axiosInstance from "../../lib/axiosInstance";

interface TicketFormProps {
  mode?: "create" | "edit";
  initialValues?: Partial<{
    title: string;
    description: string;
    price: number;
    ticketCount: number;
    home: string;
    away: string;
    stadium: string;
    adjacentSeat: string;
    gameDay: string;
  }>;
  onClose?: () => void;
}

export default function TicketForm({
  mode = "create",
  initialValues,
  onClose,
}: TicketFormProps) {
  const addToast = useToastStore((state) => state.addToast);

  const [form, setForm] = useState({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    price: initialValues?.price?.toString() || "",
    ticketCount: initialValues?.ticketCount?.toString() || "",
    home: initialValues?.home || "",
    away: initialValues?.away || "",
    stadium: initialValues?.stadium || "",
    adjacentSeat: initialValues?.adjacentSeat === "Y" ? true : false,
  });

  const [gameDay, setGameDay] = useState<Date | null>(
    initialValues?.gameDay ? new Date(initialValues.gameDay) : null
  );
  const [images, setImages] = useState<File[]>([]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleCheckbox = () => {
    setForm({ ...form, adjacentSeat: !form.adjacentSeat });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.price ||
      !gameDay ||
      !form.ticketCount ||
      !form.home ||
      !form.away ||
      !form.stadium ||
    ) {
      addToast("필수 항목을 모두 입력해주세요 ❌", "error");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description || "",
      price: Number(form.price),
      gameDay: gameDay.toISOString().slice(0, 19),
      ticketCount: Number(form.ticketCount),
      home: form.home,
      away: form.away,
      stadium: form.stadium,
      adjacentSeat: form.adjacentSeat ? "Y" : "N",
    };

    try {
      const formData = new FormData();
      formData.append(
        "ticket",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
      images.forEach((file) => formData.append("images", file));

      const res = await axiosInstance.post("/api/tickets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.status === "success") {
        addToast("티켓이 등록되었습니다 🎉", "success");
        onClose?.();
      } else {
        addToast(res.data.message || "등록 실패 ❌", "error");
      }
    } catch (err) {
      console.error("티켓 등록 오류:", err);
      addToast("서버 오류가 발생했습니다 ❌", "error");
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

        {/* 구장 + 연석 */}
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

        {/* 이미지 업로드 */}
        <label className="block">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            이미지 업로드 (선택)
          </span>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-28 hover:bg-gray-50">
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-500">
              클릭 또는 드래그하여 업로드
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFile}
              className="hidden"
            />
          </label>
          {images.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              선택된 파일 {images.length}개
            </p>
          )}
        </label>

        {/* 버튼 */}
        <button
          type="submit"
          className="w-full py-3 rounded-lg font-semibold transition-colors bg-[#6F00B6] text-white hover:bg-[#8A2BE2]"
        >
          {mode === "create" ? "등록하기" : "수정 완료"}
        </button>
      </form>
    </div>
  );
}
