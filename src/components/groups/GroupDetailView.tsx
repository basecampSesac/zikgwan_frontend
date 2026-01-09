import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance";
import ShareButton from "../common/ShareButton";
import { useToastStore } from "../../store/toastStore";
import ConfirmModal from "../../Modals/ConfirmModal";
import { formatDate } from "../../utils/format";
import { useAuthStore } from "../../store/authStore";
import {
  FiCalendar,
  FiMapPin,
  FiTrash2,
  FiEdit3,
  FiCheckCircle,
  FiRefreshCcw,
} from "react-icons/fi";
import { FaRegUserCircle } from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi";
import { BiBaseball } from "react-icons/bi";
import type { CommunityDetail, GroupUI, ApiResponse } from "../../types/group";
import { getDefaultStadiumImage } from "../../constants/stadiums";
import { MANNER_GUIDE } from "../../data/guides";
import { useChatWidgetStore } from "../../store/chatWidgetStore";
import GroupForm from "../groups/GroupForm";
import Modal from "../Modal";
import UserAvatar from "../common/UserAvatar";

export default function GroupDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const { openPopup } = useChatWidgetStore();

  const [group, setGroup] = useState<GroupUI | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [members, setMembers] = useState<
    Array<{ nickname: string; club: string; imageUrl: string }>
  >([]);

  // 상세 조회
  const fetchGroupDetail = useCallback(async () => {
    try {
      const res = await axiosInstance.get<ApiResponse<CommunityDetail>>(
        `/api/communities/${id}`
      );

      if (res.data.status === "success" && res.data.data) {
        const g = res.data.data;
        /*
        //로컬 이미지 저장
        const fullImageUrl = g.imageUrl
          ? `http://localhost:8080/images/${g.imageUrl.replace(/^\/+/, "")}`
          : undefined;
          */
        //AWS S3 이미지 저장
        const fullImageUrl = g.imageUrl ? g.imageUrl : undefined;

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
          imageUrl: fullImageUrl,
        };
        setGroup(mapped);
      } else {
        addToast("모임 정보를 불러오지 못했습니다.", "error");
      }
    } catch (err) {
      console.error("모임 상세 조회 실패:", err);
      addToast("서버 오류가 발생했습니다.", "error");
    }
  }, [id, addToast]);

  // 채팅방 상세 조회
  const fetchChatRoom = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/api/chatroom/community/${id}`);
      if (res.data.status === "success" && res.data.data) {
        setRoomId(res.data.data.roomId);
      } else {
        console.warn("채팅방 정보를 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error("채팅방 상세 조회 실패:", err);
    }
  }, [id]);

  // 멤버 조회
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axiosInstance.get(`/api/chatroom/user/${roomId}`);
        if (res.data.status === "success" && Array.isArray(res.data.data)) {
          setMembers(res.data.data);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error("멤버 조회 실패:", err);
        setMembers([]);
      }
    };

    if (roomId) fetchMembers();
  }, [roomId, id]);

  // 초기 로드
  useEffect(() => {
    fetchGroupDetail();

    // 로그인 상태가 아닐 경우 요청 안 함
    if (!user) return;

    fetchChatRoom();
  }, [fetchGroupDetail, fetchChatRoom, user]);

  // 수정 완료 후 반영
  const handleEditClose = async () => {
    setIsEditOpen(false);
    await fetchGroupDetail();
  };

  // 상태 변경
  const handleToggleState = async () => {
    if (!group) return;
    try {
      const res = await axiosInstance.put(`/api/communities/state/${group.id}`);
      if (res.data.status === "success") {
        const nextStatus = group.status === "모집중" ? "모집마감" : "모집중";
        setGroup({ ...group, status: nextStatus });
        addToast("모집 상태가 변경되었습니다 ✅", "success");
      } else addToast(res.data.message || "상태 변경 실패 ❌", "error");
    } catch (err) {
      console.error("상태 변경 오류:", err);
      addToast("서버 오류가 발생했습니다.", "error");
    }
  };

  // 삭제
  const handleDeleteGroup = async () => {
    try {
      const res = await axiosInstance.delete(`/api/communities/${id}`);
      if (res.data.status === "success") {
        addToast("모임이 삭제되었습니다 ✅", "success");
        navigate("/groups");
      } else addToast(res.data.message || "삭제 실패 ❌", "error");
    } catch (err) {
      console.error("모임 삭제 오류:", err);
      addToast("모임 삭제 중 오류가 발생했습니다.", "error");
    } finally {
      setIsDeleteOpen(false);
    }
  };

  // 모임 참여 (채팅방 연결)
  const handleJoinGroup = () => {
    if (!user) {
      addToast("로그인 후 모임에 참여할 수 있어요.", "error");
      return;
    }
    if (!roomId) {
      addToast("채팅방 정보를 불러오지 못했습니다.", "error");
      return;
    }
    openPopup(roomId, group!.title, members.length, group!.leader);
  };

  if (!group) {
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-500">
        모임 정보를 불러오는 중입니다...
      </main>
    );
  }

  const isEnded =
    group.status === "모집마감" || members.length >= (group.personnel ?? 0);
  const isLeader = user?.nickname === group.leader;

  return (
    <main className="bg-white flex items-center justify-center py-10 px-4">
      <div className="relative w-full max-w-7xl">
        <div className="bg-white rounded-2xl p-10 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-10">
            {/* 이미지 영역 */}
            <div className="flex flex-col relative">
              <div className="relative w-full h-[450px] bg-gray-100 flex items-center justify-center rounded-2xl overflow-hidden border border-gray-100">
                {!isEnded && (
                  <span className="absolute top-3 left-3 px-3 py-1.5 text-sm font-semibold rounded-md text-white bg-[#6F00B6] z-20">
                    모집중
                  </span>
                )}
                <img
                  src={
                    group.imageUrl
                      ? group.imageUrl
                      : getDefaultStadiumImage(group.stadiumName)
                  }
                  alt="모임 이미지"
                  className="w-full h-full object-cover"
                />
                {isEnded && (
                  <div className="absolute inset-0 bg-black/55 z-10 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                      모집 완료
                    </span>
                  </div>
                )}
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
                <div className="mb-4">
                  <button
                    onClick={handleJoinGroup}
                    className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition ${
                      isEnded
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#8A2BE2] to-[#6F00B6] text-white hover:opacity-90"
                    }`}
                    disabled={isEnded}
                  >
                    {isEnded ? "모집이 완료된 모임입니다" : "모임 참여하기"}
                  </button>
                </div>

                {/* 관리 버튼 그룹 */}
                <div className="flex items-center justify-end gap-3 mt-3">
                  {isLeader && (
                    <>
                      <button
                        onClick={handleToggleState}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#6F00B6] transition"
                      >
                        {group.status === "모집중" ? (
                          <>
                            <FiCheckCircle size={15} />
                            모집 완료로 변경
                          </>
                        ) : (
                          <>
                            <FiRefreshCcw size={15} />
                            모집 재개하기
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setIsEditOpen(true)}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#6F00B6] transition"
                      >
                        <FiEdit3 size={16} />
                        수정
                      </button>

                      <button
                        onClick={() => setIsDeleteOpen(true)}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition"
                      >
                        <FiTrash2 size={15} />
                        삭제
                      </button>
                    </>
                  )}

                  <ShareButton />
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
                  {MANNER_GUIDE.map((text, idx) => (
                    <li key={idx}>{text}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-3 text-lg">
                  👥 함께하는 멤버
                </h4>
                {members.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    아직 참여한 멤버가 없습니다.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {members.map((m, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 transition"
                      >
                        {/* 왼쪽: 프로필 + 닉네임 */}
                        <div className="flex items-center gap-3 -ml-1">
                          <div className="flex items-center gap-3 -ml-1">
                            <UserAvatar
                              imageUrl={m.imageUrl}
                              nickname={m.nickname}
                              size={36}
                            />
                            <span className="font-medium text-gray-900">
                              {m.nickname ?? "익명"}
                            </span>
                          </div>
                        </div>

                        {/* 오른쪽: 구단명 */}
                        <span className="text-xs text-gray-500">{m.club}</span>
                      </li>
                    ))}
                  </ul>
                )}
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

      {/* 수정 모달 */}
      {isEditOpen && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
          <GroupForm
            mode="edit"
            initialValues={{
              id: group.id,
              title: group.title,
              content: group.content,
              stadiumName: group.stadiumName,
              teams: group.teams,
              personnel: group.personnel,
              date: group.date,
              imageUrl: group.imageUrl,
            }}
            onClose={handleEditClose}
          />
        </Modal>
      )}
    </main>
  );
}
