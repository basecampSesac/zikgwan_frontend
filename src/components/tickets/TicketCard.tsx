import { Calendar, User } from "lucide-react";
import Modal from "../Modal";
import type { TicketUI } from "../../types/ticket";

export default function TicketCard({
  title,
  gameDate,
  price,
  ticketCount,
  stadiumName,
  seller,
  status,
  imageUrl,
}: TicketUI) {
  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      {/* 이미지 영역 */}
      <div className="relative h-40">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        {/* 상태 뱃지 */}
        {status === "판매중" && (
          <span className="absolute top-2 left-2 bg-[#6F00B6] text-white text-xs font-semibold px-2 py-0.5 rounded">
            판매중
          </span>
        )}
        {status === "판매완료" && (
          <span className="absolute top-2 left-2 bg-gray-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
            판매완료
          </span>
        )}

        {/* 구장명 뱃지 */}
        <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          {stadiumName}
        </span>
      </div>
      {/* 본문 */}
      <div className="p-4 flex flex-col justify-between">
        {/* 제목 */}
        <h2 className="text-base font-bold leading-snug mb-2 line-clamp-2">
          {title}
        </h2>

        {/* 날짜 */}
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
          <Calendar size={16} />
          <span>{gameDate}</span>
        </div>

        {/* 가격 + 매수 + 유저 */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-gray-700">
                {price}
              </span>
              <span className="text-sm text-gray-500">· {ticketCount}매</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-gray-400 text-xs">
              <User size={14} />
              <span>{seller.nickname}</span>
              <span>({seller.rate})</span>
            </div>
          </div>

          <Modal
            buttonText="상세보기"
            classes="text-sm px-4 py-2 rounded-md font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          />
        </div>
      </div>
    </article>
  );
}
