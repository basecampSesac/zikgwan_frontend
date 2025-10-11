import { Calendar, User, UserRound } from "lucide-react";
import type { GroupUI } from "../../types/group";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/format";
import { getDefaultStadiumImage } from "../../constants/stadiums";

export default function GroupCard({
  id,
  title,
  teams,
  date,
  stadiumName,
  personnel,
  leader,
  status,
  imageUrl,
}: GroupUI) {
  const navigate = useNavigate();

  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      {/* 이미지 영역 */}
      <div className="relative h-40" onClick={() => navigate(`/groups/${id}`)}>
        <img
          src={imageUrl || getDefaultStadiumImage(stadiumName)}
          alt={title}
          className="w-full h-full object-cover"
        />

        {status && (
          <span
            className={`absolute top-2 left-2 text-white text-xs font-semibold px-2 py-0.5 rounded ${
              status === "모집중" ? "bg-[#6F00B6]" : "bg-gray-600"
            }`}
          >
            {status}
          </span>
        )}
        <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          {stadiumName}
        </span>
      </div>

      {/* 본문 */}
      <div className="p-4 flex flex-col justify-between h-[calc(100%-10rem)]">
        <h2 className="text-base font-bold leading-snug mb-1 line-clamp-1">
          {title}
        </h2>
        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{teams}</p>

        {/* 날짜 */}
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
          <Calendar size={16} />
          <span>{formatDate(date)}</span>
        </div>

        {/* 인원 + 리더 */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <UserRound size={16} />
            <span>{personnel}명 모집중</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <User size={14} />
            <span>{leader}</span>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/groups/${id}`)}
            className="flex-1 text-sm px-4 py-2 rounded-md font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-center"
          >
            상세보기
          </button>
          <button
            onClick={() => navigate(`/groups/${id}`)}
            className="flex-1 text-sm px-4 py-2 rounded-md font-semibold bg-[#8A2BE2] text-white hover:bg-[#6F00B6] transition text-center"
          >
            참여하기
          </button>
        </div>
      </div>
    </article>
  );
}
