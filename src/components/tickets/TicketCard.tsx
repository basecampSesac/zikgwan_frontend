import { Calendar, User, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { TicketUI } from "../../types/ticket";
import { formatDate, formatPrice } from "../../utils/format";
import { getDefaultStadiumImage } from "../../constants/stadiums";
import { useState } from "react";

export default function TicketCard({
  tsId,
  title,
  price,
  gameDay,
  ticketCount,
  stadium,
  nickname,
  rating,
  state,
  imageUrl,
}: TicketUI) {
  const navigate = useNavigate();

  // 구장 이미지
  const resolvedImageUrl =
    imageUrl && imageUrl.trim() !== ""
      ? imageUrl.startsWith("http")
        ? imageUrl
        : imageUrl.startsWith("/")
        ? imageUrl
        : `http://localhost:8080/images/${imageUrl.replace(/^\/+/, "")}`
      : getDefaultStadiumImage(stadium);

  const [imgSrc, setImgSrc] = useState(resolvedImageUrl);

  const handleClick = () => navigate(`/tickets/${tsId}`);

  // 상태 변환 ("ING" → "판매중")
  const status = state === "ING" ? "판매중" : "판매완료";

  return (
    <article
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden transition cursor-pointer"
      onClick={handleClick}
    >
      {/* 이미지 */}
      <div className="relative h-44">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-[1.02]"
          onError={() => {
            if (imgSrc !== getDefaultStadiumImage(stadium)) {
              setImgSrc(getDefaultStadiumImage(stadium));
            }
          }}
        />

        {/* 상태 뱃지 */}
        <span
          className={`absolute top-2 left-2 text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow ${
            status === "판매중" ? "bg-[#6F00B6]" : "bg-gray-500"
          }`}
        >
          {status}
        </span>

        {/* 구장명 */}
        <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          {stadium}
        </span>
      </div>

      {/* 본문 */}
      <div className="flex flex-col gap-2 p-4">
        {/* 제목 */}
        <h3 className="text-[17px] font-bold text-gray-900 line-clamp-1">
          {title}
        </h3>

        {/* 경기일시 */}
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <Calendar size={15} className="text-gray-400" />
          <span>{formatDate(gameDay)}</span>
        </div>

        {/* 가격 + 매수 */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-[18px] font-extrabold text-[#111] leading-none">
            {formatPrice(price)}원
          </span>
          <span className="text-sm text-gray-500 leading-none translate-y-[1px]">
            {ticketCount}매
          </span>
        </div>

        {/* 판매자 + 별점 */}
        <div className="flex items-center justify-between mt-1 text-gray-500">
          {/* 판매자 */}
          <div className="flex items-center gap-1 min-w-0">
            <User size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-[13px] font-medium truncate max-w-[120px]">
              {nickname}
            </span>
          </div>

          {/* 별점 */}
          {rating != null && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star
                size={13}
                className="text-yellow-400 fill-yellow-400 flex-shrink-0"
              />
              <span className="text-[13px] leading-none">{rating}</span>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <button className="w-full mt-3 py-2 text-sm font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">
          상세보기
        </button>
      </div>
    </article>
  );
}
