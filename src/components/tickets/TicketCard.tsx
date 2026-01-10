import { Calendar, User, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { memo, useMemo, useState } from "react";
import type { TicketUI } from "../../types/ticket";
import { formatDate, formatPrice } from "../../utils/format";
import { getDefaultStadiumImage } from "../../constants/stadiums";
import { useAuthStore } from "../../store/authStore";
import { OptimizedImage } from "../common/OptimizedImage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const TicketCard = function TicketCard({
  tsId,
  title,
  price,
  gameDay,
  home,
  away,
  ticketCount,
  adjacentSeat,
  stadium,
  nickname,
  rating,
  state,
  imageUrl,
}: TicketUI) {
const navigate = useNavigate();
  const { user } = useAuthStore();

  // 구장 이미지
  const resolvedImageUrl = useMemo(() => 
    imageUrl && imageUrl.trim() !== ""
      ? imageUrl.startsWith("http")
        ? imageUrl
        : imageUrl.startsWith("/")
        ? imageUrl
        : `${API_URL}/images/${imageUrl.replace(/^\/+/, "")}`
      : getDefaultStadiumImage(stadium),
    [imageUrl, stadium]
  );

  const [imgSrc, setImgSrc] = useState(resolvedImageUrl);

  const handleImageError = () => {
    if (imgSrc !== getDefaultStadiumImage(stadium)) {
      setImgSrc(getDefaultStadiumImage(stadium));
    }
  };

const handleClick = () => navigate(`/tickets/${tsId}`);

  // 상태 변환 ("ING" → "판매중")
  const status = useMemo(() => state === "ING" ? "판매중" : "판매 완료", [state]);
  const isEnded = status === "판매 완료";
  const isSeller = user?.nickname === nickname;

return (
    <article
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6F00B6] focus:ring-offset-2"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`티켓 상세보기: ${title} - ${home} vs ${away} - ${formatPrice(price)}원`}
    >
{/* 이미지 */}
      <div className="relative h-32 sm:h-40 md:h-44">
        <OptimizedImage
          src={imgSrc}
          alt={title}
          className="w-full h-full transition-transform duration-200 hover:scale-[1.02]"
          fallbackSrc={getDefaultStadiumImage(stadium)}
          onError={handleImageError}
        />

{/* 판매완료 시 블랙 오버레이 + 중앙 문구 */}
        {isEnded && (
          <div className="absolute inset-0 bg-black/55 z-10 flex items-center justify-center">
            <span className="text-white text-sm sm:text-base md:text-lg font-bold tracking-wide">
              판매 완료
            </span>
          </div>
        )}

{/* 상태 뱃지 (판매중일 때만 표시) */}
        {!isEnded && (
          <>
            <span className="absolute top-2 left-2 text-white text-xs sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-md shadow bg-[#6F00B6] z-20">
              판매중
            </span>
            <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 sm:px-2 py-0.5 rounded z-20 truncate max-w-[80px] sm:max-w-none">
              {stadium}
            </span>
          </>
        )}
      </div>

{/* 본문 */}
      <div className="flex flex-col gap-2 p-3 sm:p-4">
{/* 매치업 */}
        <div className="flex items-center justify-between text-sm sm:text-base md:text-[17px] font-bold text-gray-900 line-clamp-1">
          <span className="font-medium truncate">
            {home} vs {away}
          </span>
        </div>

        {/* 제목 */}
        <div className="flex items-center justify-between text-gray-500 text-xs sm:text-sm">
          <span className="truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px]">{title}</span>
        </div>

{/* 경기일시 */}
        <div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm">
          <Calendar size={15} className="text-gray-400 flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
          <span className="truncate">{formatDate(gameDay)}</span>
        </div>

{/* 가격 + 매수 + 연석 */}
        <div className="flex items-baseline justify-between mt-2">
          {/* 왼쪽 묶음: 가격 + 매수 */}
          <div className="flex items-baseline gap-1 sm:gap-2 min-w-0">
            <span className="text-base sm:text-lg md:text-[18px] font-extrabold text-[#111] leading-none truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px]">
              {formatPrice(price)}원
            </span>
            <span className="text-xs sm:text-sm text-gray-500 leading-none translate-y-[1px]">
              {ticketCount}매
            </span>
          </div>

          <span className="text-xs sm:text-sm font-bold text-gray-700 flex-shrink-0 ml-1 sm:ml-2">
            연석: {adjacentSeat === "Y" ? "Y" : "N"}
          </span>
        </div>

{/* 판매자 + 별점 */}
        <div className="flex items-center justify-between mt-1 text-gray-500">
          {/* 판매자 */}
          <div className="flex items-center gap-1 min-w-0">
            <User size={14} className="text-gray-400 flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-[13px] font-medium truncate max-w-[80px] sm:max-w-[100px] md:max-w-[120px]">
              {nickname}
            </span>
          </div>

          {/* 별점 */}
          {rating != null && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star
                size={13}
                className="text-yellow-400 fill-yellow-400 flex-shrink-0 w-3 h-3 sm:w-3.5 sm:h-3.5"
              />
              <span className="text-xs sm:text-[13px] leading-none">{rating}</span>
            </div>
          )}
        </div>

{/* 버튼 */}
        <button
          disabled={isEnded && !isSeller}
          className={`w-full mt-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#6F00B6] focus:ring-offset-2 ${
            isEnded && !isSeller
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          aria-label={isEnded ? (isSeller ? "티켓 관리하기" : "판매 완료된 티켓") : "티켓 상세보기"}
        >
          {isEnded ? (isSeller ? "티켓 관리하기" : "판매 완료") : "상세보기"}
        </button>
      </div>
    </article>
);
};

export default memo(TicketCard);
