// src/page/SignupPage.tsx
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [club, setClub] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [nicknameMessage, setNicknameMessage] = useState("");
  const [nicknameAvailable, setNicknameAvailable] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(false);

  // 이메일 중복 확인 + 인증번호 발송
  const handleSendCode = async () => {
    if (!email) return;
    try {
      const chk = await fetch(`${API_URL}/api/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then((r) => r.json());

      if (!chk.success) {
        setEmailMessage(chk.message || "이미 사용 중인 이메일입니다.");
        setEmailAvailable(false);
        return;
      }
      setEmailMessage("가입이 가능한 이메일입니다.");
      setEmailAvailable(true);

      const snd = await fetch(`${API_URL}/api/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then((r) => r.json());

      if (snd.success) alert("인증번호가 이메일로 발송되었습니다.");
      else alert(snd.message || "인증번호 발송 실패");
    } catch (e) {
      console.error(e);
      setEmailMessage("이메일 처리 중 오류가 발생했습니다.");
    }
  };

  // 인증번호 검증
  const handleVerifyCode = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      }).then((r) => r.json());

      if (res.success) {
        alert("이메일 인증이 완료되었습니다.");
        setIsEmailVerified(true);
      } else {
        alert("인증번호가 올바르지 않습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("인증번호 확인 중 오류가 발생했습니다.");
    }
  };

  // 닉네임 중복 확인
  const handleNicknameChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setNickname(value);
    if (!value) {
      setNicknameMessage("");
      setNicknameAvailable(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/check-nickname`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: value }),
      }).then((r) => r.json());

      if (res.success) {
        setNicknameMessage("사용 가능한 닉네임입니다.");
        setNicknameAvailable(true);
      } else {
        setNicknameMessage(res.message || "이미 사용 중인 닉네임입니다.");
        setNicknameAvailable(false);
      }
    } catch (e) {
      console.error(e);
      setNicknameMessage("닉네임 확인 중 오류가 발생했습니다.");
      setNicknameAvailable(false);
    }
  };

  const handleSignup = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nickname, club, password }),
      }).then((r) => r.json());

      if (res.success) {
        alert("회원가입이 완료되었습니다. 로그인 해주세요.");
        navigate("/login");
      } else {
        alert(res.message || "회원가입에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  const isPasswordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isValid =
    email.trim() !== "" &&
    nickname.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    password === confirmPassword &&
    isPasswordValid &&
    isEmailVerified &&
    nicknameAvailable;

  // 버튼 공통(라인·보라 텍스트)
  const btnLine =
    "rounded-lg border border-gray-300 text-[#6F00B6] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <main className="flex flex-1 justify-center bg-white min-h-screen pt-20">
      <div className="w-full max-w-sm p-6 rounded-lg bg-white">
        <h1 className="text-2xl font-bold mb-8 text-center">회원가입</h1>

        {/* 이메일 */}
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            이메일*
          </span>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요."
              className="input-border h-11"
              disabled={isEmailVerified}
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={isEmailVerified}
              className="button-border min-w-[6rem] h-11 flex items-center justify-center text-sm font-medium text-[#6F00B6] hover:bg-gray-50"
            >
              {isEmailVerified ? "인증 완료" : "인증번호 받기"}
            </button>
          </div>
        </label>

        {/* 인증번호 */}
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            인증번호*
          </span>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="인증번호를 입력해주세요."
              className="input-border h-11"
              disabled={isEmailVerified}
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              className="button-border min-w-[6rem] h-11 flex items-center justify-center text-sm font-medium text-[#6F00B6] hover:bg-gray-50"
            >
              {isEmailVerified ? "완료" : "확인"}
            </button>
          </div>
        </label>

        {/* 비밀번호 */}
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            비밀번호*
          </span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요."
              className="input-border pr-10 h-11"
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
        <label className="block mb-6">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            비밀번호 확인*
          </span>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력해주세요."
              className="input-border pr-10 h-11"
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

        {/* 닉네임 */}
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            닉네임*
          </span>
          <input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="닉네임을 입력해주세요."
            className="input-border h-11"
          />
          {nicknameMessage && (
            <p
              className={`text-sm mt-1 ${
                nicknameAvailable ? "text-green-600" : "text-red-500"
              }`}
            >
              {nicknameMessage}
            </p>
          )}
        </label>

        {/* 구단 선택 */}
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1 text-gray-600">
            좋아하는 구단 (선택)
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

        <button
          onClick={() => navigate("/login")}
          className="button-border text-gray-600 hover:bg-gray-100 mb-4 w-full h-11"
        >
          ← 로그인 화면으로 돌아가기
        </button>

        <button
          onClick={handleSignup}
          disabled={!isValid}
          className={`w-full h-11 rounded-lg font-semibold transition-colors ${
            isValid
              ? "bg-[#6F00B6] text-white hover:bg-[#8A2BE2]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          가입하기
        </button>
      </div>
    </main>
  );
}
