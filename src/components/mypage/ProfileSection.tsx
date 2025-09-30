import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import ConfirmDeleteModal from "../../Modals/ConfirmDeleteModal";
import { useAuthStore } from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function ProfileSection() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);

  // 입력값 state
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [club, setClub] = useState(user?.club || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 비밀번호 표시 toggle
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // 프로필 이미지
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.profileImage || null
  );
  const [errorMessage, setErrorMessage] = useState("");

  // 탈퇴 모달
  const [openModal, setOpenModal] = useState(false);

  // 비밀번호 정책
  const isPasswordValid =
    newPassword.length >= 8 &&
    newPassword.length <= 16 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  // 저장하기
  const handleSave = async () => {
    if (newPassword && !currentPassword) {
      alert("현재 비밀번호를 입력해야 새 비밀번호를 설정할 수 있습니다.");
      return;
    }
    if (newPassword && !isPasswordValid) {
      alert(
        "비밀번호는 영문 대소문자, 숫자, 특수문자를 포함한 8~16자여야 합니다."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nickname: nickname || undefined,
          club: club || undefined,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("회원 정보가 정상적으로 수정되었습니다.");
        setUser({
          ...user!,
          nickname,
          club,
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data?.message || "회원 정보 수정에 실패했습니다.");
      }
    } catch (err) {
      console.error("회원정보 수정 오류:", err);
      alert("회원 정보 수정 중 오류가 발생했습니다.");
    }
  };

  // 회원탈퇴
  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert("회원탈퇴가 완료되었습니다.");
        logout();
        window.location.href = "/";
      } else {
        alert(data?.message || "회원탈퇴에 실패했습니다.");
      }
    } catch (err) {
      console.error("회원탈퇴 오류:", err);
      alert("회원탈퇴 중 오류가 발생했습니다.");
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

      const res = await fetch(`${API_URL}/api/user/profile-image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfileImage(data.url);
        setUser({ ...user!, profileImage: data.url });
      } else {
        throw new Error(data.message || "업로드 실패");
      }
    } catch (err) {
      console.error("프로필 업로드 오류:", err);
      setProfileImage(prevImage);
      setErrorMessage(
        "프로필 이미지를 업로드하지 못했습니다. 다시 시도해주세요."
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 text-center">프로필 수정</h1>

      {/* 프로필 섹션 */}
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
        <label className="px-3 py-1 rounded-md text-sm font-medium bg-[#6F00B6] text-white hover:bg-[#8A2BE2] cursor-pointer">
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
          <option value="두산">두산 베어스</option>
          <option value="롯데">롯데 자이언츠</option>
          <option value="삼성">삼성 라이온즈</option>
          <option value="SSG">SSG 랜더스</option>
          <option value="키움">키움 히어로즈</option>
          <option value="KT">KT 위즈</option>
          <option value="NC">NC 다이노스</option>
          <option value="LG">LG 트윈스</option>
          <option value="기아">기아 타이거즈</option>
          <option value="한화">한화 이글스</option>
        </select>
      </label>

      {/* 저장하기 */}
      <button
        onClick={handleSave}
        className="w-full h-11 rounded-lg font-semibold bg-[#6F00B6] text-white hover:bg-[#8A2BE2] transition"
      >
        저장하기
      </button>

      {/* 회원탈퇴 */}
      <p className="text-xs text-center text-gray-500 mt-4">
        회원탈퇴를 원하신다면{" "}
        <span
          className="underline cursor-pointer text-red-600"
          onClick={() => setOpenModal(true)}
        >
          여기
        </span>
        를 눌러주세요.
      </p>

      <ConfirmDeleteModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
