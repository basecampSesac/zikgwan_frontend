import { Calendar, User, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axiosInstance";
import axios, { AxiosError } from "axios";
import type { GroupUI } from "../../types/group";
import { formatDate } from "../../utils/format";
import { getDefaultStadiumImage } from "../../constants/stadiums";

const imageCache = new Map<number, string>();

export default function GroupCard({
  id,
  title,
  teams,
  date,
  stadiumName,
  personnel,
  leader,
  status,
}: GroupUI) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  useEffect(() => {
    const fetchImage = async () => {
      if (imageCache.has(id)) {
        setImageUrl(imageCache.get(id) || undefined);
        return;
      }

      try {
        const res = await axiosInstance.get(`/api/images/C/${id}`);
        if (res.data.status === "success" && res.data.data) {
          const url = `http://localhost:8080${res.data.data}`;
          imageCache.set(id, url);
          setImageUrl(url);
        } else imageCache.set(id, "");
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const err = error as AxiosError;
          if (err.response?.status !== 404)
            console.warn(`이미지 요청 실패 [${id}]`, err.message);
        }
        imageCache.set(id, "");
      }
    };

    fetchImage();
  }, [id]);

  return (
    <article
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
      onClick={() => navigate(`/groups/${id}`)}
    >
      {/* 이미지 영역 */}
      <div className="relative h-44">
        <img
          src={imageUrl || getDefaultStadiumImage(stadiumName)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-[1.02]"
        />

        {/* 상태 뱃지 */}
        {status && (
          <span
            className={`absolute top-2 left-2 text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow ${
              status === "모집중" ? "bg-[#6F00B6]" : "bg-gray-500"
            }`}
          >
            {status}
          </span>
        )}
        {/* 구장명 뱃지 */}
        <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          {stadiumName}
        </span>
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
            <span>{personnel}명 모집중</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <User size={13} />
            <span>{leader}</span>
          </div>
        </div>

        {/* 버튼 */}
        <button className="w-full mt-3 py-2 text-sm font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">
          상세보기
        </button>
      </div>
    </article>
  );
}
