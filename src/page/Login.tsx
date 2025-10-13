import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axiosInstance from "../lib/axiosInstance";
import { useToastStore } from "../store/toastStore";
import PasswordReset from "../components/auth/PasswordReset";
import axios from "axios";
import { useEffect } from "react";

export default function LoginPage() {
  const { email, password, setEmail, setPassword, login } = useAuthStore();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const isValid = email.trim() !== "" && password.trim() !== "";

  // 로그인 요청
  const handleLogin = async () => {
    try {
      const res = await axiosInstance.post("/api/user/login", {
        email,
        password,
      });

      const { status, data } = res.data;

      if (status === "success" && data) {
        const userInfo = {
          nickname: data.nickname,
          email: data.email,
          club: data.club,
          userId: data.userId,
        };

        login(userInfo, data.token, data.refreshToken, rememberMe);
        // 로그인 후 프로필 이미지 조회
        try {
          const imgRes = await axiosInstance.get(
            `/api/images/U/${data.userId}`
          );
          if (imgRes.data.status === "success" && imgRes.data.data) {
            const imageUrl = `http://localhost:8080${imgRes.data.data}`;
            // Zustand user 업데이트 (profileImage 반영)
            useAuthStore.getState().setUser({
              ...userInfo,
              profileImage: imageUrl,
            });
          }
        } catch {
          console.log("⚠️ 프로필 이미지 없음 (기본 회색 표시)");
        }
        addToast(`${data.nickname || "회원"}님, 환영합니다! 🎉`, "success");
        navigate("/");
        return;
      }

      // 로그인 실패
      addToast("이메일 또는 비밀번호가 올바르지 않습니다.", "error");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        if (msg === "로그인 실패") {
          addToast("이메일 또는 비밀번호가 올바르지 않습니다.", "error");
        } else {
          addToast("로그인 중 오류가 발생했습니다.", "error");
        }
      } else {
        addToast("서버 연결 오류가 발생했습니다.", "error");
      }

      console.error("로그인 요청 오류:", err);
    }
  };

  // 카카오로 로그인
  const handleKakaoLogin = async () => {
    try {
      const res = await axiosInstance.get("/api/socialLogin/kakao/loginUrl");
      const { status, data } = res.data;
      if (status === "success" && data) {
        // 카카오 로그인 URL로 이동
        window.location.href = data;
      } else {
        addToast("카카오 로그인 URL을 불러오지 못했습니다.", "error");
      }
    } catch (err) {
      addToast("카카오 로그인 중 오류가 발생했습니다.", "error");
      console.error(err);
    }
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nickname = params.get("nickname");
    const email = params.get("email");

    // 백엔드에서 토큰을 쿠키(HttpOnly)로 심었으니 accessToken은 프론트에서 안 받음
    if (nickname && email) {
      const userInfo = {
        userId: 0,
        email,
        nickname,
        club: undefined,
      };

      // 토큰은 없지만 "로그인 성공" 상태로 전환 (세션 유지)
      login(userInfo, "", "", true);
      addToast(`${nickname}님, 환영합니다! 🎉`, "success");
      navigate("/");
    }
  }, [login, addToast, navigate]);

  // 비밀번호 재설정 모드
  if (isResetMode) {
    return (
      <main className="flex flex-1 justify-center bg-white min-h-screen pt-20">
        <div className="w-full max-w-sm p-6 rounded-lg bg-white">
          <PasswordReset onBack={() => setIsResetMode(false)} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 justify-center bg-white min-h-screen pt-20">
      <div className="w-full max-w-sm p-6 rounded-lg bg-white">
        <h1 className="text-2xl font-bold mb-8 text-center">이메일로 로그인</h1>

        {/* 이메일 */}
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            이메일
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력해주세요."
            className="input-border"
          />
        </label>

        {/* 비밀번호 */}
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            비밀번호
          </span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요."
              className="input-border pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
          </div>
        </label>

        {/* 옵션 */}
        <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-[#6F00B6] hover:accent-[#8A2BE2]"
            />
            로그인 유지
          </label>
          <button
            type="button"
            onClick={() => setIsResetMode(true)}
            className="hover:underline"
          >
            비밀번호 재설정
          </button>
        </div>

        {/* 로그인 버튼 */}
        <button
          onClick={handleLogin}
          disabled={!isValid}
          className={`w-full py-3 rounded-lg font-semibold mb-6 transition-colors ${
            isValid
              ? "bg-[#6F00B6] text-white hover:bg-[#8A2BE2]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          로그인
        </button>

        {/* 회원가입 이동 */}
        <div className="flex items-center mb-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-gray-400 text-sm">또는</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <button
          className="button-border text-[#6F00B6] hover:bg-gray-50"
          onClick={() => navigate("/signup")}
        >
          이메일로 계속하기
        </button>

        {/* 소셜 로그인 */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-gray-400 text-sm">
            소셜 계정으로 로그인
          </span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <div className="space-y-3">
          {/* 카카오 로그인 */}
          <button
            onClick={handleKakaoLogin}
            className="relative flex items-center justify-center w-full rounded-lg overflow-hidden"
            style={{
              backgroundImage: "url('/kakao_login.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "50px",
            }}
          >
            <span className="sr-only">카카오로 로그인</span>
          </button>
          <button className="button-border text-black hover:bg-gray-50">
            네이버로 로그인
          </button>
          <button className="button-border text-black hover:bg-gray-50">
            구글로 로그인
          </button>
        </div>
      </div>
    </main>
  );
}
