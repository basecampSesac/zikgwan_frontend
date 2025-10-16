import { Calendar, User, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { GroupUI } from "../../types/group";
import { formatDate } from "../../utils/format";
import { getDefaultStadiumImage } from "../../constants/stadiums";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";

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
  const { user } = useAuthStore();

  const isEnded = status === "모집마감";
  const isLeader = user?.nickname === leader;

  const resolvedImageUrl =
    imageUrl && imageUrl.trim() !== ""
      ? imageUrl.startsWith("http")
        ? imageUrl
        : imageUrl.startsWith("/")
        ? imageUrl
        : `http://localhost:8080/images/${imageUrl.replace(/^\/+/, "")}`
      : getDefaultStadiumImage(stadiumName);

  const [imgSrc, setImgSrc] = useState(resolvedImageUrl);

  const handleClick = () => {
    if (isEnded && !isLeader) return;
    navigate(`/groups/${id}`);
  };

  return (
    <article
      onClick={handleClick}
      className="bg-white rounded-xl shadow-md overflow-hidden transition hover:shadow-lg cursor-pointer relative"
    >
      {/* 이미지 영역 */}
      <div className="relative h-44">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-[1.02]"
          onError={() => {
            if (imgSrc !== getDefaultStadiumImage(stadiumName)) {
              setImgSrc(getDefaultStadiumImage(stadiumName));
            }
          }}
        />

        {/* 모집마감 시 블랙 오버레이 + 중앙 문구 */}
        {isEnded && (
          <div className="absolute inset-0 bg-black/55 z-10 flex items-center justify-center">
            <span className="text-white text-lg font-bold tracking-wide">
              모집 완료
            </span>
          </div>
        )}

        {/* 상태 뱃지 (모집중일 때만 표시) */}
        {!isEnded && (
          <>
            <span className="absolute top-2 left-2 text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow bg-[#6F00B6] z-20">
              모집중
            </span>
            <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded z-20">
              {stadiumName}
            </span>
          </>
        )}
      </div>

      {/* 본문 */}
      <div className="p-4 flex flex-col gap-2">
        {/* 제목 */}
        <h3 className="text-[17px] font-bold text-gray-900 line-clamp-1">
          {title}
        </h3>

        {/* 경기 정보 */}
        <p className="text-sm text-gray-500 line-clamp-1">{teams}</p>

        {/* 날짜 */}
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <Calendar size={15} className="text-gray-400" />
          <span>{formatDate(date)}</span>
        </div>

        {/* 인원 + 리더 */}
        <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
          <div className="flex items-center gap-1">
            <UserRound size={15} />
            <span>
              {personnel}
              {isEnded ? "명 모집완료" : "명 모집중"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <User size={13} />
            <span>{leader}</span>
          </div>
        </div>

        {/* 버튼 */}
        <button
          disabled={isEnded && !isLeader}
          className={`w-full mt-3 py-2 text-sm font-semibold rounded-lg transition ${
            isEnded && !isLeader
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {isEnded ? (isLeader ? "모임 관리하기" : "모집 완료") : "상세보기"}
        </button>
      </div>
    </article>
  );
}
