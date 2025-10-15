import { Calendar, User, MapPin, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDefaultStadiumImage } from "../../constants/stadiums";
import type { TicketUI } from "../../types/ticket";

/**
 * ✅ TicketCard
 * - 티켓 목록에서 사용되는 단일 카드 컴포넌트
 * - 이미지 fallback 처리
 * - 클릭 시 상세 페이지로 이동
 */
export default function TicketCard({
  id,
  title,
  price,
  ticketCount,
  gameDate,
  stadiumName,
  seller,
  imageUrl,
  status,
}: TicketUI) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tickets/${id}`);
  };

  const formattedDate = new Date(gameDate).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const imgSrc =
    imageUrl && imageUrl.trim() !== ""
      ? imageUrl
      : getDefaultStadiumImage(stadiumName);

  return (
    <div
      onClick={handleClick}
      className="group card-hover cursor-pointer flex flex-col overflow-hidden border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all bg-white"
    >
      {/* 상단 이미지 */}
      <div className="relative w-full h-48 overflow-hidden">
        <img
          src={imgSrc}
          alt={title}
          onError={(e) => {
            e.currentTarget.src = getDefaultStadiumImage(stadiumName);
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span
          className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-md text-white ${
            status === "판매중" ? "bg-[#6F00B6]" : "bg-gray-400"
          }`}
        >
          {status}
        </span>
      </div>

      {/* 본문 */}
      <div className="flex flex-col flex-1 justify-between px-4 py-3">
        {/* 제목 */}
        <h3 className="font-semibold text-base text-gray-900 truncate mb-2 group-hover:text-[#6F00B6] transition">
          {title}
        </h3>

        {/* 정보 */}
        <div className="flex flex-col gap-1 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{stadiumName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Ticket className="w-4 h-4 text-gray-400" />
            <span>
              {ticketCount}매 ·{" "}
              <strong className="text-gray-900 font-medium">
                {price.toLocaleString()}원
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4 text-gray-400" />
            <span>{seller.nickname}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
