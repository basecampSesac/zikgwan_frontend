// cspell:disable
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axiosInstance from "../../lib/axiosInstance";
import { useToastStore } from "../../store/toastStore";
import { AxiosError } from "axios";

interface PasswordResetProps {
  onBack: () => void;
}

export default function PasswordReset({ onBack }: PasswordResetProps) {
  const { addToast } = useToastStore();

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailMessage, setEmailMessage] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // 이메일 인증번호 발송
  const handleSendCode = async () => {
    if (!email.trim()) {
      addToast("이메일을 입력해주세요.", "error");
      return;
    }
    try {
      const res = await axiosInstance.post("/api/email/send", {
        email,
        verifiedType: "P",
      });
      if (res.data.status === "success") {
        setEmailMessage("인증번호가 이메일로 발송되었습니다.");
        setEmailAvailable(true);
        addToast("인증번호가 이메일로 발송되었습니다. ✉️", "info");
      } else {
        setEmailMessage(res.data.message || "이메일 전송에 실패했습니다.");
        setEmailAvailable(false);
      }
    } catch (error) {
      console.error("이메일 인증 요청 실패:", error);
      setEmailMessage("이메일 처리 중 오류가 발생했습니다.");
      addToast("이메일 처리 중 오류가 발생했습니다.", "error");
    }
  };

  // 인증번호 검증
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      addToast("인증번호를 입력해주세요.", "error");
      return;
    }
    try {
      const res = await axiosInstance.post("/api/email/verify", {
        email,
        code: verificationCode,
        verifiedType: "P",
      });
      if (res.data.status === "success") {
        setIsEmailVerified(true);
        addToast("이메일 인증이 완료되었습니다.", "success");
      } else {
        addToast(res.data.message || "인증번호가 올바르지 않습니다.", "error");
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("인증번호 확인 실패:", err);

      const message =
        err.response?.data?.message || "인증번호 확인 중 오류가 발생했습니다.";
      addToast(message, "error");
    }
  };

  // 비밀번호 재설정
  const handleResetPassword = async () => {
    if (!isEmailVerified) {
      addToast("이메일 인증을 먼저 완료해주세요.", "error");
      return;
    }
    if (password !== confirmPassword) {
      addToast("비밀번호가 일치하지 않습니다.", "error");
      return;
    }

    try {
      const res = await axiosInstance.post("/api/user/pwReset", {
        email,
        newpassword: password,
        newpasswordconfirm: confirmPassword,
      });

      if (res.data.status === "success") {
        addToast("비밀번호가 성공적으로 변경되었습니다. 🎉", "success");
        onBack();
      } else {
        addToast(res.data.message || "비밀번호 변경에 실패했습니다.", "error");
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("비밀번호 재설정 오류:", err);

      const message =
        err.response?.data?.message || "서버 오류가 발생했습니다.";
      addToast(message, "error");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 타이틀 */}
      <h1 className="text-2xl font-bold text-center mb-4">비밀번호 재설정</h1>

      {/* 이메일 */}
      <label className="block mb-2">
        <span className="block text-sm font-medium mb-1 text-gray-600">
          이메일*
        </span>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력해주세요."
            className="input-border"
            disabled={isEmailVerified}
          />
          <button
            type="button"
            onClick={handleSendCode}
            disabled={isEmailVerified}
            className="button-border min-w-[6rem] h-12 flex items-center justify-center text-sm font-medium text-[#6F00B6] hover:bg-gray-50"
          >
            {isEmailVerified ? "인증 완료" : "인증번호 받기"}
          </button>
        </div>
        {emailMessage && (
          <p
            className={`text-sm mt-1 ${
              emailAvailable ? "text-green-600" : "text-red-500"
            }`}
          >
            {emailMessage}
          </p>
        )}
      </label>

      {/* 인증번호 */}
      <label className="block mb-2">
        <span className="block text-sm font-medium mb-1 -mt-2 text-gray-600">
          인증번호*
        </span>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="인증번호를 입력해주세요."
            className="input-border"
            disabled={isEmailVerified}
          />
          <button
            type="button"
            onClick={handleVerifyCode}
            className="button-border min-w-[6rem] h-12 flex items-center justify-center text-sm font-medium text-[#6F00B6] hover:bg-gray-50"
          >
            {isEmailVerified ? "완료" : "확인"}
          </button>
        </div>
      </label>

      {/* 새 비밀번호 */}
      <label className="block mb-2">
        <span className="block text-sm font-medium mb-1 -mt-2 text-gray-600">
          새 비밀번호*
        </span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="새 비밀번호를 입력해주세요."
            className="input-border"
            disabled={!isEmailVerified}
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
        <p className="text-xs text-gray-500 mt-1">
          영문 대소문자, 숫자, 특수문자를 포함해 8~16자로 입력해주세요.
        </p>
      </label>

      {/* 비밀번호 확인 */}
      <label className="block mb-2">
        <span className="block text-sm font-medium mb-1 -mt-2 text-gray-600">
          비밀번호 확인*
        </span>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력해주세요."
            className="input-border"
            disabled={!isEmailVerified}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showConfirmPassword ? (
              <AiOutlineEyeInvisible size={20} />
            ) : (
              <AiOutlineEye size={20} />
            )}
          </button>
        </div>
        {password !== confirmPassword && confirmPassword !== "" && (
          <p className="text-sm text-red-500 mt-1">
            비밀번호가 일치하지 않습니다.
          </p>
        )}
      </label>

      {/* 버튼 */}
      <button
        onClick={handleResetPassword}
        disabled={!isEmailVerified}
        className={`w-full h-11 rounded-lg font-semibold transition-colors ${
          isEmailVerified
            ? "bg-[#6F00B6] text-white hover:bg-[#8A2BE2]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        비밀번호 재설정하기
      </button>

      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-700 mt-1"
      >
        ← 로그인 화면으로 돌아가기
      </button>
    </div>
  );
}
