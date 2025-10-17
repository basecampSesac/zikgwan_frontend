import { Calendar, User, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { TicketUI } from "../../types/ticket";
import { formatDate, formatPrice } from "../../utils/format";
import { getDefaultStadiumImage } from "../../constants/stadiums";

export default function TicketCard({
  id,
  title,
  gameDate,
  price,
  ticketCount,
  stadiumName,
  seller,
  status,
  imageUrl,
}: TicketUI) {
  const navigate = useNavigate();

  const handleClick = () => navigate(`/tickets/${id}`);

  const imgSrc =
    imageUrl && imageUrl.trim() !== ""
      ? imageUrl
      : getDefaultStadiumImage(stadiumName);

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
          onError={(e) => {
            e.currentTarget.src = getDefaultStadiumImage(stadiumName);
          }}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-[1.02]"
        />

        {/* 상태 뱃지 */}
        {status && (
          <span
            className={`absolute top-2 left-2 text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow ${
              status === "판매중" ? "bg-[#6F00B6]" : "bg-gray-500"
            }`}
          >
            {status}
          </span>
        )}

        {/* 구장명 */}
        <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          {stadiumName}
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
          <span>{formatDate(gameDate)}</span>
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
          {/* 왼쪽: 판매자 */}
          <div className="flex items-center gap-1 min-w-0">
            <User size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-[13px] font-medium truncate max-w-[120px]">
              {seller.nickname}
            </span>
          </div>

          {/* 오른쪽: 별점 (평점 값이 있을 때만 표시) */}
          {seller.rate && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star
                size={13}
                className="text-yellow-400 fill-yellow-400 flex-shrink-0"
              />
              <span className="text-[13px] leading-none">{seller.rate}</span>
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
