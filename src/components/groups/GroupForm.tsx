import { useState } from "react";
import { Upload } from "lucide-react";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { TEAMS } from "../../constants/teams";
import { STADIUMS, getDefaultStadiumImage } from "../../constants/stadiums";
import axiosInstance from "../../lib/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/toastStore";
import type { GroupUI } from "../../types/group";
import { useGroupUpdateStore } from "../../store/groupUpdateStore";
import type { CommunityItem } from "../../types/group";

interface GroupFormProps {
  mode?: "create" | "edit";
  initialValues?: Partial<GroupUI>;
  onClose?: () => void;
  onSuccess?: (newGroup?: CommunityItem) => void;
}

export default function GroupForm({
  mode = "create",
  initialValues,
  onClose,
}: GroupFormProps) {
  const [form, setForm] = useState({
    title: initialValues?.title || "",
    content: initialValues?.content || "",
    homeTeam: initialValues?.teams?.split(" vs ")[0] || "",
    awayTeam: initialValues?.teams?.split(" vs ")[1] || "",
    stadiumName: initialValues?.stadiumName || "",
    personnel: initialValues?.personnel?.toString() || "",
  });

  const [meetingDate, setMeetingDate] = useState<Date | null>(
    initialValues?.date ? new Date(initialValues.date) : null
  );

  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    () => {
      if (!initialValues?.imageUrl) return null;
      if (initialValues.imageUrl.includes("/stadiums/")) return null;
      return initialValues.imageUrl.startsWith("http")
        ? initialValues.imageUrl
        : `http://localhost:8080/images/${initialValues.imageUrl.replace(
            /^\/+/,
            ""
          )}`;
    }
  );

  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputKey, setInputKey] = useState(Date.now());

  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const { triggerUpdate } = useGroupUpdateStore();

  /** 🔸 입력 변경 */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 파일 선택
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
      setExistingImageUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (
      !form.title ||
      !meetingDate ||
      !form.homeTeam ||
      !form.awayTeam ||
      !form.stadiumName ||
      !form.personnel
    ) {
      addToast("필수 정보를 모두 입력해주세요.", "error");
      return;
    }

    if (!user?.userId) {
      addToast("로그인이 필요합니다.", "error");
      return;
    }

    const payload = {
      title: form.title,
      description: form.content,
      date: new Date(meetingDate.getTime() - meetingDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " "),
      stadium: form.stadiumName,
      home: form.homeTeam,
      away: form.awayTeam,
      memberCount: Number(form.personnel),
    };

    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );

    if (image) {
      formData.append("image", image);
    } else {
      try {
        const defaultImagePath = getDefaultStadiumImage(form.stadiumName);
        const response = await fetch(defaultImagePath);
        const blob = await response.blob();
        formData.append("image", blob, "default.jpg");
      } catch {
        formData.append("image", "null");
      }
    }

    setIsSubmitting(true);
    try {
      let res;
      if (mode === "create") {
        res = await axiosInstance.post(`/api/communities`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data.status === "success" && res.data.data) {
          const communityId = res.data.data.communityId;
          // 채팅방 생성
          await axiosInstance.post(
            `/api/chatroom/community/${communityId}?roomName=${encodeURIComponent(
              form.title
            )}`
          );
        }
      } else {
        res = await axiosInstance.put(
          `/api/communities/${initialValues?.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      if (res.data.status === "success" && res.data.data) {
        triggerUpdate();
        addToast(
          mode === "create"
            ? "모임이 등록되었습니다 🎉"
            : "모임이 수정되었습니다 ✨",
          "success"
        );
      } else {
        addToast(res.data.message || "등록/수정 실패 ❌", "error");
      }

      onClose?.();
    } catch (err) {
      console.error("모임 등록/수정 오류:", err);
      addToast("서버 오류가 발생했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === "create" ? "모임 등록" : "모임 수정"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 제목 */}
        <label className="block">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            모임 제목*
          </span>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="예: 주말 직관 모임"
            className="input-border"
          />
        </label>

        {/* 설명 */}
        <label className="block">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            모임 설명*
          </span>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="모임 목적, 분위기 등을 입력해주세요"
            className="input-border h-24"
          />
        </label>

        {/* 날짜 */}
        <label className="block">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            모임 일자 *
          </span>
          <DatePicker
            selected={meetingDate}
            onChange={(date) => setMeetingDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            dateFormat="yyyy-MM-dd HH:mm"
            locale={ko}
            placeholderText="날짜와 시간을 선택하세요"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#6F00B6] focus:border-[#6F00B6]"
            minDate={new Date()}
          />
        </label>

        {/* 팀, 구장, 인원 */}
        <div className="grid grid-cols-2 gap-4">
          {["homeTeam", "awayTeam"].map((type) => (
            <label key={type} className="block">
              <span className="block text-sm font-medium mb-1 text-gray-600">
                {type === "homeTeam" ? "홈팀*" : "원정팀*"}
              </span>
              <select
                name={type}
                value={form[type as "homeTeam" | "awayTeam"]}
                onChange={handleChange}
                className="input-border"
              >
                <option value="">선택</option>
                {TEAMS.map((team) => (
                  <option
                    key={team.value}
                    value={team.value}
                    disabled={
                      type === "homeTeam"
                        ? form.awayTeam === team.value
                        : form.homeTeam === team.value
                    }
                  >
                    {team.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        {/* 구장 */}
        <label className="block">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            야구장*
          </span>
          <select
            name="stadiumName"
            value={form.stadiumName}
            onChange={handleChange}
            className="input-border"
          >
            <option value="">야구장 선택</option>
            {STADIUMS.map((stadium) => (
              <option key={stadium} value={stadium}>
                {stadium}
              </option>
            ))}
          </select>
        </label>

        {/* 인원 */}
        <label className="block">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            모집 인원*
          </span>
          <input
            type="number"
            name="personnel"
            value={form.personnel}
            onChange={handleChange}
            min={1}
            max={10}
            placeholder="예: 5"
            className="input-border"
          />
        </label>

        {/* 이미지 업로드 */}
        <label className="block">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            이미지 업로드 (선택)
          </span>

          <label
            htmlFor="imageInput"
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-28 hover:bg-gray-50 overflow-hidden relative cursor-pointer"
          >
            {image ? (
              <div className="relative h-full aspect-[4/3]">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="h-full w-auto object-cover rounded-md pointer-events-none"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImage(null);
                    setInputKey(Date.now()); // ✅ input 재생성으로 자동 업로드 방지
                  }}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-10"
                >
                  ×
                </button>
              </div>
            ) : existingImageUrl ? (
              <div className="relative h-full aspect-[4/3]">
                <img
                  src={existingImageUrl}
                  alt="preview"
                  className="h-full w-auto object-cover rounded-md pointer-events-none"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setExistingImageUrl(null);
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
                <span className="text-xs text-gray-500">
                  클릭하여 이미지 선택
                </span>
              </div>
            )}
          </label>

          <input
            key={inputKey}
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </label>

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
