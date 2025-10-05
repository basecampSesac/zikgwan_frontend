import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import { useToastStore } from "../store/toastStore";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { addToast } = useToastStore();

  // 비밀번호 유효성 검사 (영문 대소문자 + 숫자 + 특수문자)
  const isPasswordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleResetPassword = async () => {
    if (!token) {
      addToast("유효하지 않은 접근입니다.", "error");
      return;
    }
    if (!isPasswordValid) {
      addToast("비밀번호 형식이 올바르지 않습니다.", "error");
      return;
    }
    if (password !== confirmPassword) {
      addToast("비밀번호가 일치하지 않습니다.", "error");
      return;
    }

    try {
      const res = await axiosInstance.post("/api/auth/reset", {
        token,
        password,
      });

      if (res.data.status === "success") {
        addToast("비밀번호가 성공적으로 변경되었습니다. 🎉", "success");
        navigate("/login");
      } else {
        addToast(res.data.message || "비밀번호 변경에 실패했습니다.", "error");
      }
    } catch (error) {
      console.error("비밀번호 재설정 오류:", error);
      addToast("서버 오류가 발생했습니다.", "error");
    }
  };

  return (
    <main className="flex flex-1 justify-center bg-white min-h-screen pt-20">
      <div className="w-full max-w-sm p-6 rounded-lg bg-white">
        {/* 타이틀 */}
        <h1 className="text-2xl font-bold text-center mb-6">
          새 비밀번호 설정
        </h1>

        {/* 안내문 */}
        <p className="text-sm text-gray-600 text-center mb-8 leading-relaxed">
          새로운 비밀번호를 입력해주세요.
          <br />
          영문 대소문자, 숫자, 특수문자를 포함해야 합니다.
        </p>

        {/* 비밀번호 입력 */}
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            새 비밀번호
          </span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="새 비밀번호를 입력해주세요."
              className="input-border pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
          </div>
          {!isPasswordValid && password && (
            <p className="text-xs text-red-500 mt-1">
              8자 이상, 영문 대소문자/숫자/특수문자를 포함해야 합니다.
            </p>
          )}
        </label>

        {/* 비밀번호 확인 */}
        <label className="block mb-6">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            비밀번호 확인
          </span>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력해주세요."
              className="input-border pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirm ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              비밀번호가 일치하지 않습니다.
            </p>
          )}
        </label>

        <button
          onClick={handleResetPassword}
          disabled={!password || !confirmPassword}
          className={`w-full h-11 rounded-lg font-semibold transition-colors ${
            !password || !confirmPassword
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#6F00B6] text-white hover:bg-[#8A2BE2]"
          }`}
        >
          비밀번호 변경하기
        </button>

        <button
          onClick={() => navigate("/login")}
          className="text-sm text-gray-500 hover:text-gray-700 mt-4 w-full text-center"
        >
          ← 로그인 화면으로 돌아가기
        </button>
      </div>
    </main>
  );
}
