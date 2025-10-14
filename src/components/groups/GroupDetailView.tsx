import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance";
import ShareButton from "../common/ShareButton";
import { useToastStore } from "../../store/toastStore";
import ConfirmModal from "../../Modals/ConfirmModal";
import { formatDate } from "../../utils/format";
import { useAuthStore } from "../../store/authStore";
import { FiCalendar, FiMapPin, FiTrash2 } from "react-icons/fi";
import { FaRegUserCircle } from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi";
import { BiBaseball } from "react-icons/bi";
import type { CommunityDetail, GroupUI, ApiResponse } from "../../types/group";
import { getDefaultStadiumImage } from "../../constants/stadiums";
import { MOCK_MEMBERS } from "../../data/members";
import { useChatWidgetStore } from "../../store/chatWidgetStore";

export default function GroupDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [group, setGroup] = useState<GroupUI | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { openPopup } = useChatWidgetStore();

  // 상세 조회
  useEffect(() => {
    const fetchGroupDetail = async () => {
      try {
        const res = await axiosInstance.get<ApiResponse<CommunityDetail>>(
          `/api/communities/${id}`
        );

        if (res.data.status === "success" && res.data.data) {
          const g = res.data.data;

          // 이미지 별도 조회
          let imageUrl: string | undefined;
          try {
            const imgRes = await axiosInstance.get(
              `/api/images/C/${g.communityId}`
            );
            if (imgRes.data.status === "success" && imgRes.data.data) {
              imageUrl = `http://localhost:8080${imgRes.data.data}`;
            }
          } catch {
            imageUrl = undefined;
          }

          const mapped: GroupUI = {
            id: g.communityId,
            title: g.title,
            content: g.description,
            date: formatDate(g.date),
            stadiumName: g.stadium,
            teams: `${g.home} vs ${g.away}`,
            personnel: g.memberCount,
            leader: g.nickname,
            status: g.state === "ING" ? "모집중" : "모집마감",
            userId: g.userId ?? undefined,
            createdAt: g.createdAt,
            updatedAt: g.updatedAt,
            imageUrl,
          };
          setGroup(mapped);
        } else {
          addToast("모임 정보를 불러오지 못했습니다.", "error");
        }
      } catch (err) {
        console.error("모임 상세 조회 실패:", err);
        addToast("서버 오류가 발생했습니다.", "error");
      }
    };

    fetchGroupDetail();
  }, [id, addToast]);

  // 삭제
  const handleDeleteGroup = async () => {
    try {
      const res = await axiosInstance.delete(`/api/group/${id}`);
      if (res.data.status === "success") {
        addToast("모임이 삭제되었습니다 ✅", "success");
        navigate("/groups");
      } else {
        addToast(res.data.message || "삭제 실패 ❌", "error");
      }
    } catch (err) {
      console.error("모임 삭제 오류:", err);
      addToast("모임 삭제 중 오류가 발생했습니다.", "error");
    } finally {
      setIsDeleteOpen(false);
    }
  };

  if (!group) {
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-500">
        모임 정보를 불러오는 중입니다...
      </main>
    );
  }

  return (
    <main className="bg-white flex items-center justify-center py-10 px-4">
      <div className="relative w-full max-w-7xl">
        <div className="bg-white rounded-2xl p-10 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-10">
            {/* 이미지 영역 */}
            <div className="flex flex-col relative">
              <div className="relative w-full h-[450px] bg-gray-100 flex items-center justify-center rounded-2xl overflow-hidden border border-gray-100">
                <span
                  className={`absolute top-3 left-3 px-3 py-1.5 text-sm font-semibold rounded-md text-white ${
                    group.status === "모집중" ? "bg-[#6F00B6]" : "bg-gray-400"
                  }`}
                >
                  {group.status}
                </span>

                <img
                  src={
                    group.imageUrl
                      ? group.imageUrl
                      : getDefaultStadiumImage(group.stadiumName)
                  }
                  alt="모임 이미지"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 오른쪽 정보 영역 */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mt-5 mb-6 text-gray-900 tracking-tight">
                  {group.title}
                </h2>

                <div className="text-gray-700 mb-4 divide-y divide-gray-100">
                  {[
                    { icon: <FiCalendar size={22} />, text: group.date },
                    { icon: <BiBaseball size={22} />, text: group.teams },
                    { icon: <FiMapPin size={22} />, text: group.stadiumName },
                    {
                      icon: <HiOutlineUsers size={22} />,
                      text: `모집 인원: ${group.personnel}명`,
                    },
                    {
                      icon: <FaRegUserCircle size={22} />,
                      text: `모임장: ${group.leader}`,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 py-3 transition rounded-md"
                    >
                      <span className="text-gray-500">{item.icon}</span>
                      <span className="text-lg">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* 팝업 연결 */}
                <div className="mb-8">
                  <button
                    onClick={() => {
                      if (!user) {
                        addToast("로그인 후 모임에 참여할 수 있어요.", "error");
                        return;
                      }
                      openPopup(group.id);
                    }}
                    className="w-full px-6 py-3 rounded-lg font-semibold text-lg bg-gradient-to-r from-[#8A2BE2] to-[#6F00B6] text-white hover:opacity-90 transition"
                  >
                    모임 참여하기
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3 mt-8">
                  <ShareButton />
                  {user?.nickname && group?.leader === user.nickname && (
                    <button
                      onClick={() => setIsDeleteOpen(true)}
                      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition"
                    >
                      <FiTrash2 size={16} />
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* 상세 설명 + 사이드 정보 */}
          <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-8">
            <div className="bg-gray-50 rounded-xl p-6 min-h-[370px] flex flex-col overflow-y-auto border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                모임 설명
              </h3>
              <p className="text-[17px] md:text-lg text-gray-800 leading-[1.9] whitespace-pre-line flex-1">
                {group.content || "모임에 대한 설명이 없습니다."}
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-2 text-lg">
                  모임 매너 가이드
                </h4>
                <ul className="list-disc pl-5 text-gray-600 text-sm leading-relaxed">
                  <li>약속된 시간과 장소를 지켜주세요.</li>
                  <li>참석이 어려울 땐 미리 모임원들에게 알려주세요.</li>
                  <li>
                    응원 스타일이 달라도 서로 존중하는 마음을 잊지 마세요.
                  </li>
                  <li>예의 있는 대화를 부탁드려요.</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-3 text-lg">
                  👥 함께하는 멤버
                </h4>
                <ul className="space-y-2">
                  {MOCK_MEMBERS.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 transition"
                    >
                      <span className="font-medium text-gray-800">
                        {m.nickname}
                      </span>
                      <span className="text-xs text-gray-500">{m.team}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모임 삭제 모달 */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="모임 삭제"
        description={
          "정말 이 모임을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다."
        }
        confirmText="삭제하기"
        cancelText="취소"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteGroup}
      />
    </main>
  );
}
