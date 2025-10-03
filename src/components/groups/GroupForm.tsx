import { useState } from "react";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { TEAMS } from "../../constants/teams";
import { STADIUMS } from "../../constants/stadiums";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.title ||
      !meetingDate ||
      !form.homeTeam ||
      !form.awayTeam ||
      !form.stadiumName ||
      !form.personnel
    ) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    // GroupUI에 맞춘 payload
    const payload: GroupUI = {
      id: initialValues?.id || Date.now(),
      title: form.title,
      content: form.content,
      date: meetingDate.toISOString(),
      stadiumName: form.stadiumName,
      teams: `${form.homeTeam} vs ${form.awayTeam}`,
      personnel: Number(form.personnel),
      leader: initialValues?.leader || "알 수 없음",
      status: initialValues?.status || "모집중",
      imageUrl: initialValues?.imageUrl,
    };

    if (mode === "create") {
      console.log("POST /api/groups", payload);
      alert("모임이 등록되었습니다 🎉");
    } else {
      console.log("PUT /api/groups/:id", payload);
      alert("모임이 수정되었습니다 ✨");
    }

    onClose?.();
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

        {/* 모임 일자 */}
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

        {/* 홈/어웨이 팀 */}
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
              <option value="" disabled>
                선택
              </option>
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
              <option value="" disabled>
                선택
              </option>
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
