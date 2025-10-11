import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import ConfirmModal from "../../Modals/ConfirmModal";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/toastStore";
import { TEAMS } from "../../constants/teams";
import axiosInstance from "../../lib/axiosInstance";
import axios, { AxiosError } from "axios";

export default function ProfileSection() {
  const { user, logout, setUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [nickname, setNickname] = useState(user?.nickname || "");
  const [club, setClub] = useState(user?.club || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(
    user?.profileImage || null
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);

  // 비밀번호 형식 검사
  const isPasswordValid =
    newPassword.length >= 8 &&
    newPassword.length <= 16 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  // 회원정보 수정
  const handleSave = async () => {
    if (!user) return;

    // 모든 수정 시 현재 비밀번호 필수
    if (!currentPassword) {
      addToast("회원 정보를 수정하려면 현재 비밀번호를 입력해주세요.", "error");
      return;
    }

    if (newPassword && !isPasswordValid) {
      addToast(
        "비밀번호는 영문 대소문자, 숫자, 특수문자를 포함한 8~16자여야 합니다.",
        "error"
      );
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      addToast("새 비밀번호가 일치하지 않습니다.", "error");
      return;
    }

    try {
      const payload: {
        nickname: string;
        email: string;
        club: string;
        password: string;
        newpassword?: string;
        newpasswordconfirm?: string;
      } = {
        nickname,
        email: user.email,
        club,
        password: currentPassword,
      };

      if (newPassword) {
        payload.newpassword = newPassword;
        payload.newpasswordconfirm = confirmPassword;
      }

      const { data } = await axiosInstance.put(
        `/api/user/${user.userId}`,
        payload
      );

      if (data.status === "success") {
        addToast("회원 정보가 정상적으로 수정되었습니다.", "success");
        setUser({
          ...user,
          nickname: data.data.nickname || nickname,
          club: data.data.club || club,
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        addToast(data.message || "회원 정보 수정에 실패했습니다.", "error");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{
          status: string;
          message: string;
        }>;
        console.error(
          "회원정보 수정 오류:",
          axiosError.response?.data || axiosError.message
        );

        if (axiosError.response?.status === 401) {
          addToast("세션이 만료되었습니다. 다시 로그인해주세요.", "error");
          logout();
          window.location.href = "/login";
        } else {
          addToast(
            axiosError.response?.data?.message ||
              "회원정보 수정 중 오류가 발생했습니다.",
            "error"
          );
        }
      } else {
        console.error("예상치 못한 오류:", err);
        addToast("알 수 없는 오류가 발생했습니다.", "error");
      }
    }
  };

  // 회원탈퇴
  const handleDelete = async () => {
    if (!user) return;
    try {
      const { data } = await axiosInstance.patch(
        `/api/user/delete/${user.userId}`
      );
      if (data.status === "success" && data.data === true) {
        addToast("회원탈퇴가 완료되었습니다.", "success");
        logout();
        window.location.href = "/";
      } else {
        addToast(data.message || "회원탈퇴에 실패했습니다.", "error");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{
          status: string;
          message: string;
        }>;
        console.error(
          "회원탈퇴 오류:",
          axiosError.response?.data || axiosError.message
        );
        addToast(
          axiosError.response?.data?.message ||
            "회원탈퇴 중 오류가 발생했습니다.",
          "error"
        );
      } else {
        console.error("예상치 못한 오류:", err);
        addToast("알 수 없는 오류가 발생했습니다.", "error");
      }
    } finally {
      setOpenModal(false);
    }
  };

  // 프로필 이미지 업로드
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const prevImage = profileImage;
    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axiosInstance.post(
        "/api/user/profile-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data.status === "success") {
        setProfileImage(data.url);
        setUser({ ...user!, profileImage: data.url });
        addToast("프로필 이미지가 변경되었습니다.", "success");
      } else {
        throw new Error(data.message || "업로드 실패");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ message?: string }>;
        console.error(
          "프로필 업로드 오류:",
          axiosError.response?.data || axiosError.message
        );
      } else {
        console.error("예상치 못한 오류:", err);
      }
      setProfileImage(prevImage);
      setErrorMessage(
        "프로필 이미지를 업로드하지 못했습니다. 다시 시도해주세요."
      );
      addToast("프로필 이미지 업로드 실패", "error");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 text-center">프로필 수정</h1>

      {/* 프로필 이미지 */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-300 mb-2 overflow-hidden">
          {(profileImage || user?.profileImage) && (
            <img
              src={profileImage || user?.profileImage || ""}
              alt="프로필"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <label className="px-3 py-1 rounded-md text-sm font-medium bg-[#8A2BE2] text-white hover:bg-[#6F00B6]">
          변경하기
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
        {errorMessage && (
          <p className="text-xs text-red-500 mt-2">{errorMessage}</p>
        )}
      </div>

      {/* 이메일 */}
      <label className="block mb-4">
        <span className="block text-sm font-medium mb-1 text-gray-600">
          이메일
        </span>
        <input
          type="text"
          value={user?.email || ""}
          disabled
          className="input-border h-11 bg-gray-100 cursor-not-allowed"
        />
      </label>

      {/* 비밀번호 변경 */}
      <span className="block text-sm font-medium mb-1 text-gray-600">
        비밀번호 변경
      </span>

      {/* 현재 비밀번호 */}
      <label className="block mb-4">
        <div className="relative">
          <input
            type={showCurrentPw ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호를 입력해주세요."
            className="input-border h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showCurrentPw ? (
              <AiOutlineEyeInvisible size={20} />
            ) : (
              <AiOutlineEye size={20} />
            )}
          </button>
        </div>
      </label>

      {/* 새 비밀번호 */}
      <label className="block mb-4">
        <div className="relative">
          <input
            type={showNewPw ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호를 입력해주세요."
            className="input-border h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNewPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showNewPw ? (
              <AiOutlineEyeInvisible size={20} />
            ) : (
              <AiOutlineEye size={20} />
            )}
          </button>
        </div>
        {newPassword && !isPasswordValid && (
          <p className="text-xs text-red-500 mt-1">
            비밀번호는 영문 대소문자, 숫자, 특수문자를 포함한 8~16자여야 합니다.
          </p>
        )}
      </label>

      {/* 새 비밀번호 확인 */}
      <label className="block mb-6">
        <div className="relative">
          <input
            type={showConfirmPw ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="새 비밀번호를 확인해주세요."
            className="input-border h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showConfirmPw ? (
              <AiOutlineEyeInvisible size={20} />
            ) : (
              <AiOutlineEye size={20} />
            )}
          </button>
        </div>
      </label>

      {/* 닉네임 */}
      <label className="block mb-4">
        <span className="block text-sm font-medium mb-1 text-gray-600">
          닉네임
        </span>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="input-border h-11"
          placeholder={user?.nickname || "닉네임 입력"}
        />
      </label>

      {/* 구단 */}
      <label className="block mb-6">
        <span className="block text-sm font-medium mb-1 text-gray-600">
          좋아하는 구단
        </span>
        <select
          value={club}
          onChange={(e) => setClub(e.target.value)}
          className="input-border h-11"
        >
          <option value="">선택 안 함</option>
          {TEAMS.map((team) => (
            <option key={team.value} value={team.value}>
              {team.label}
            </option>
          ))}
        </select>
      </label>

      {/* 저장하기 */}
      <button
        onClick={handleSave}
        className="w-full h-11 rounded-lg font-semibold bg-[#8A2BE2] text-white hover:bg-[#6F00B6] transition"
      >
        저장하기
      </button>

      {/* 회원탈퇴 */}
      <p className="text-xs text-center text-gray-500 mt-4">
        회원탈퇴를 원하신다면{" "}
        <span
          className="underline text-red-600"
          onClick={() => setOpenModal(true)}
        >
          여기
        </span>
        를 눌러주세요.
      </p>

      <ConfirmModal
        isOpen={openModal}
        title="회원탈퇴"
        description={
          "정말로 회원탈퇴를 하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다."
        }
        confirmText="탈퇴하기"
        cancelText="취소"
        onClose={() => setOpenModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
