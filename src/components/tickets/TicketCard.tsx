import { Calendar, User } from "lucide-react";
import Modal from "../Modal";

type Ticket = {
  title: string;
  date: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  location: string;
  user: string;
  rate: number;
  status?: string; // 예: "급매"
  imageUrl?: string;
};

export default function TicketCard({
  title,
  date,
  price,
  originalPrice,
  discount,
  location,
  user,
  rate,
  status,
  imageUrl,
}: Ticket) {
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
        {status && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
            {status}
          </span>
        )}
        <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          {location}
        </span>
      </div>

      {/* 본문 */}
      <div className="p-4 flex flex-col justify-between h-[calc(100%-10rem)]">
        {/* 제목 */}
        <h2 className="text-base font-bold leading-snug mb-2 line-clamp-2">
          {title}
        </h2>

        {/* 날짜 */}
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
          <Calendar size={16} />
          <span>{date}</span>
        </div>

        {/* 가격 + 유저 + 버튼 */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold  text-gray-700 hover:bg-gray-200">
                {price}원
              </span>
              {originalPrice && (
                <span className="text-gray-400 line-through text-sm">
                  {originalPrice}원
                </span>
              )}
              {discount && (
                <span className="text-green-600 text-sm font-semibold">
                  {discount} 할인
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1 text-gray-400 text-xs">
              <User size={14} />
              <span>{user}</span>
              <span>({rate})</span>
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
