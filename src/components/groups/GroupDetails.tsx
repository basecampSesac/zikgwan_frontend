import { useState } from "react";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { TEAMS } from "../../constants/teams";
import { STADIUMS } from "../../constants/stadiums";

export default function GroupDetails() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    home: "",
    away: "",
    stadium: "",
    personnel: "",
  });

  const [meetingDay, setMeetingDay] = useState<Date | null>(null);

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
      !meetingDay ||
      !form.home ||
      !form.away ||
      !form.stadium ||
      !form.personnel
    ) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    const payload = {
      ...form,
      meeting_day: meetingDay.toISOString(),
    };

    console.log("모임 등록 데이터:", payload);
    alert("모임이 성공적으로 등록되었습니다.");
  };

  return (
    <div className="flex flex-col w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">모임 등록</h2>

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
            name="description"
            value={form.description}
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
            selected={meetingDay}
            onChange={(date) => setMeetingDay(date)}
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
              name="home"
              value={form.home}
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
                  disabled={form.away === team.value}
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
              name="away"
              value={form.away}
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
                  disabled={form.home === team.value}
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
            name="stadium"
            value={form.stadium}
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
          등록하기
        </button>
      </form>
    </div>
  );
}
