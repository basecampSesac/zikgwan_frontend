import { useState } from "react";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { TEAMS } from "../../constants/teams";
import { STADIUMS } from "../../constants/stadiums";
import axiosInstance from "../../lib/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/toastStore";
import type { GroupUI } from "../../types/group";

interface GroupFormProps {
  mode?: "create" | "edit";
  initialValues?: Partial<GroupUI>;
  onClose?: () => void;
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

  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      date: meetingDate.toISOString().slice(0, 19).replace("T", " "), // "2025-10-06 00:00:00" 형식으로
      stadium: form.stadiumName,
      home: form.homeTeam,
      away: form.awayTeam,
      memberCount: Number(form.personnel),
    };

    try {
      if (mode === "create") {
        const res = await axiosInstance.post(
          `/api/communities/${user.userId}`,
          payload
        );

        if (res.data.status === "success") {
          addToast("모임이 등록되었습니다 🎉", "success");

          // 모임 등록 성공 시 채팅방도 생성
          const communityId = res.data.data.communityId;
          await axiosInstance.post(
            `/api/chatroom/community/${communityId}?roomName=${encodeURIComponent(
              form.title
            )} `
          );
        } else {
          addToast(res.data.message || "모임 등록 실패", "error");
        }
      } else {
        const res = await axiosInstance.put(
          `/api/communities/${initialValues?.id}`,
          payload
        );

        if (res.data.status === "success") {
          addToast("모임이 수정되었습니다 ✨", "success");
        } else {
          addToast(res.data.message || "모임 수정 실패", "error");
        }
      }

      onClose?.();
    } catch (err) {
      console.error("모임 등록/수정 오류:", err);
      addToast("서버 오류가 발생했습니다.", "error");
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
          />
        </label>

        {/* 팀, 구장, 인원 */}
        {/* 홈/어웨이 팀 선택 */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1 text-gray-600">
              홈팀*
            </span>
            <select
              name="homeTeam"
              value={form.homeTeam}
              onChange={handleChange}
              className="input-border"
              required
            >
              <option value="">선택</option>
              {TEAMS.map((team) => (
                <option
                  key={team.value}
                  value={team.value}
                  disabled={form.awayTeam === team.value}
                >
                  {team.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1 text-gray-600">
              원정팀*
            </span>
            <select
              name="awayTeam"
              value={form.awayTeam}
              onChange={handleChange}
              className="input-border"
              required
            >
              <option value="">선택</option>
              {TEAMS.map((team) => (
                <option
                  key={team.value}
                  value={team.value}
                  disabled={form.homeTeam === team.value}
                >
                  {team.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* 구장 선택 */}
        <label className="block">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            야구장*
          </span>
          <select
            name="stadiumName"
            value={form.stadiumName}
            onChange={handleChange}
            className="input-border"
            required
          >
            <option value="">야구장 선택</option>
            {STADIUMS.map((stadium) => (
              <option key={stadium} value={stadium}>
                {stadium}
              </option>
            ))}
          </select>
        </label>

        {/* 모집 인원 */}
        <label className="block">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            모집 인원*
          </span>
          <input
            type="number"
            name="personnel"
            value={form.personnel}
            onChange={handleChange}
            placeholder="예: 5"
            className="input-border"
          />
        </label>

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
