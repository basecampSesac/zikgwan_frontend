import { Calendar, MapPin, User, UserRound } from "lucide-react";
import Modal from "../Modal";

interface Group {
  title: string;
  teams: string;
  date: string;
  location: string;
  personnel: string;
  leader: string;
  imageUrl?: string;
  status?: string; // 예: "모집중"
}

export default function GroupCard({
  title,
  teams,
  date,
  location,
  personnel,
  leader,
  imageUrl,
  status,
}: Group) {
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
          <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
            {status}
          </span>
        )}
        <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          {location}
        </span>
      </div>

      {/* 본문 */}
      <div className="p-4 flex flex-col justify-between h-[calc(100%-10rem)]">
        {/* 제목 + 팀 */}
        <h2 className="text-base font-bold leading-snug mb-1 line-clamp-1">
          {title}
        </h2>
        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{teams}</p>

        {/* 날짜 */}
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
          <Calendar size={16} />
          <span>{date}</span>
        </div>

        {/* 인원 + 리더 */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <UserRound size={16} />
            <span>{personnel}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <User size={14} />
            <span>{leader}</span>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-2">
          <Modal
            buttonText="상세보기"
            classes="flex-1 text-sm px-4 py-2 rounded-md font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-center"
          />
          <Modal
            buttonText="참여하기"
            classes="flex-1 text-sm px-4 py-2 rounded-md font-semibold bg-[#8A2BE2] text-white hover:bg-[#6F00B6] transition text-center"
          />
        </div>
      </div>
    </article>
  );
}
