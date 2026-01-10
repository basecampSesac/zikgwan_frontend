import { TEAMS } from "../../constants/teams";
import { STADIUMS } from "../../constants/stadiums";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import { Upload } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import type { TicketFormData } from "../../hooks/useTicketForm";

interface TicketFormFieldsProps {
  form: TicketFormData;
  gameDay: Date | null;
  image: File | null;
  existingImageUrl: string | null;
  inputKey: number;
  setGameDay: (date: Date | null) => void;
  setImage: (file: File | null) => void;
  setExistingImageUrl: (url: string | null) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCheckbox: () => void;
  handleFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

/**
 * 티켓 폼 입력 필드 컴포넌트
 */
export function TicketFormFields({
  form,
  gameDay,
  image,
existingImageUrl,
    inputKey,
    setGameDay,
    handleChange,
    handleCheckbox,
    handleFile,
    disabled = false,
}: TicketFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          제목 *
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          disabled={disabled}
          placeholder="예: 임실주차장에서 직관하실분"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F00B6] disabled:bg-gray-100"
          required
        />
      </div>

      {/* 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          설명
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          disabled={disabled}
          placeholder="티켓에 대한 추가 정보를 입력해주세요"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F00B6] disabled:bg-gray-100"
        />
      </div>

      {/* 홈/어웨이 팀 선택 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            홈 팀 *
          </label>
          <select
            name="home"
            value={form.home}
            onChange={handleChange}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F00B6] disabled:bg-gray-100"
            required
          >
            <option value="">선택하세요</option>
            {TEAMS.map((team) => (
              <option key={team.value} value={team.value}>
                {team.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            어웨이 팀 *
          </label>
          <select
            name="away"
            value={form.away}
            onChange={handleChange}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F00B6] disabled:bg-gray-100"
            required
          >
            <option value="">선택하세요</option>
            {TEAMS.map((team) => (
              <option key={team.value} value={team.value}>
                {team.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 구장 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          구장 *
        </label>
        <select
          name="stadium"
          value={form.stadium}
          onChange={handleChange}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F00B6] disabled:bg-gray-100"
          required
        >
          <option value="">선택하세요</option>
          {STADIUMS.map((stadium) => (
            <option key={stadium} value={stadium}>
              {stadium}
            </option>
          ))}
        </select>
      </div>

      {/* 경기일시 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          경기일시 *
        </label>
        <DatePicker
          selected={gameDay}
          onChange={setGameDay}
          disabled={disabled}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={30}
          dateFormat="yyyy년 MM월 dd일 HH:mm"
          locale={ko}
          placeholderText="경기 일시를 선택해주세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F00B6] disabled:bg-gray-100"
          wrapperClassName="w-full"
          required
        />
      </div>

      {/* 가격 및 매수 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            가격 (원) *
          </label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            disabled={disabled}
            placeholder="10000"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F00B6] disabled:bg-gray-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            매수 *
          </label>
          <input
            type="number"
            name="ticketCount"
            value={form.ticketCount}
            onChange={handleChange}
            disabled={disabled}
            placeholder="1"
            min="1"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F00B6] disabled:bg-gray-100"
            required
          />
        </div>
      </div>

      {/* 연석 여부 */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="adjacentSeat"
          checked={form.adjacentSeat}
          onChange={handleCheckbox}
          disabled={disabled}
          className="mr-2 w-4 h-4 text-[#6F00B6] border-gray-300 rounded focus:ring-[#6F00B6] disabled:opacity-50"
        />
        <label htmlFor="adjacentSeat" className="text-sm font-medium text-gray-700">
          연석입니다
        </label>
      </div>

      {/* 이미지 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이미지
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              key={inputKey}
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={disabled}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Upload size={16} />
              <span className="text-sm">이미지 선택</span>
            </label>
            {(image || existingImageUrl) && (
              <span className="text-sm text-green-600">
                {image ? "새 이미지 선택됨" : "기존 이미지 유지"}
              </span>
            )}
          </div>

          {/* 이미지 미리보기 */}
          {(image || existingImageUrl) && (
            <div className="mt-2">
              <img
                src={image ? URL.createObjectURL(image) : existingImageUrl || ""}
                alt="티켓 이미지 미리보기"
                className="w-full h-48 object-cover rounded-md border border-gray-200"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}