import { useState } from "react";
import axiosInstance from "../../lib/axiosInstance";
import { useToastStore } from "../../store/toastStore";

interface PasswordResetProps {
  onBack: () => void;
}

export default function PasswordReset({ onBack }: PasswordResetProps) {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const { addToast } = useToastStore();

  const handleSendLink = async () => {
    if (!email.trim()) {
      addToast("이메일을 입력해주세요.", "error");
      return;
    }

    try {
      const res = await axiosInstance.post("/api/user/pwReset", { email });

      if (res.data.status === "success") {
        setIsSent(true);
        addToast(
          "비밀번호 재설정 링크가 이메일로 발송되었습니다. ✉️",
          "success"
        );
      } else {
        addToast(res.data.message || "등록되지 않은 이메일입니다.", "error");
      }
    } catch (error) {
      console.error("비밀번호 재설정 요청 실패:", error);
      addToast("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 타이틀 */}
      <h1 className="text-2xl font-bold text-center mb-2">비밀번호 재설정</h1>

      {/* 설명문 */}
      {!isSent ? (
        <p className="text-sm text-gray-600 text-center leading-relaxed mb-2">
          가입하신 이메일 주소를 입력하시면
          <br />
          비밀번호 재설정 링크를 보내드립니다.
        </p>
      ) : (
        <p className="text-sm text-gray-600 text-center leading-relaxed">
          비밀번호 재설정 링크가 발송되었습니다.
          <br />
          이메일을 확인해주세요 ✉️
        </p>
      )}

      {/* 입력 필드 */}
      {!isSent && (
        <label className="block py-2">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            이메일 주소
          </span>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소를 입력해주세요."
              className="input-border pl-10"
            />
          </div>
        </label>
      )}

      {/* 버튼 영역 */}
      {!isSent ? (
        <button
          onClick={handleSendLink}
          className="w-full h-11 rounded-lg font-semibold transition-colors bg-[#6F00B6] text-white hover:bg-[#8A2BE2]"
        >
          재설정 링크 보내기
        </button>
      ) : (
        <button
          onClick={onBack}
          className="w-full h-11 rounded-lg font-semibold transition-colors bg-[#6F00B6] text-white hover:bg-[#8A2BE2]"
        >
          로그인 화면으로 돌아가기
        </button>
      )}

      {/* 하단 돌아가기 버튼 (아직 미전송 상태일 때만 표시) */}
      {!isSent && (
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 mt-1"
        >
          ← 로그인 화면으로 돌아가기
        </button>
      )}
    </div>
  );
}
