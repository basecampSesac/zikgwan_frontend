// src/page/SignupPage.tsx
import { useState, useEffect } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import { TEAMS } from "../constants/teams";

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

  // 이메일 인증번호 발송
  const handleSendCode = async () => {
    if (!email) return;
    try {
      const res = await axiosInstance.post("/api/email/send", { email });
      if (res.data.status !== "success") {
        setEmailMessage(res.data.message || "이미 사용 중인 이메일입니다.");
        setEmailAvailable(false);
        return;
      }
      setEmailMessage("가입이 가능한 이메일입니다.");
      setEmailAvailable(true);
      alert(res.data.data || "인증번호가 이메일로 발송되었습니다.");
    } catch (e) {
      console.error(e);
      setEmailMessage("이메일 처리 중 오류가 발생했습니다.");
    }
  };

  // 인증번호 검증
  const handleVerifyCode = async () => {
    try {
      const res = await axiosInstance.post("/api/email/verify", {
        email,
        code: verificationCode,
      });
      if (res.data.status === "success") {
        alert("이메일 인증이 완료되었습니다.");
        setIsEmailVerified(true);
      } else {
        alert(res.data.message || "인증번호가 올바르지 않습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("인증번호 확인 중 오류가 발생했습니다.");
    }
  };

  // 닉네임 입력 시 (즉시 상태 업데이트)
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  // 닉네임 중복 확인 (디바운스: 2초)
  useEffect(() => {
    if (!nickname) {
      setNicknameMessage("");
      setNicknameAvailable(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axiosInstance.post("/api/user/chknickname", {
          nickname,
        });

        if (res.data.status === "success" && res.data.data === false) {
          setNicknameMessage("사용 가능한 닉네임입니다.");
          setNicknameAvailable(true);
        } else {
          setNicknameMessage(
            res.data.message || "이미 사용 중인 닉네임입니다."
          );
          setNicknameAvailable(false);
        }
      } catch (e) {
        console.error(e);
        setNicknameMessage("닉네임 확인 중 오류가 발생했습니다.");
        setNicknameAvailable(false);
      }
    }, 2000); // 2초 대기 후 실행

    return () => clearTimeout(timer); // cleanup
  }, [nickname]);

  // 회원가입
  const handleSignup = async () => {
    try {
      const res = await axiosInstance.post("/api/user/signup", {
        email,
        nickname,
        club,
        password,
      });
      if (res.data.status === "success") {
        alert("회원가입이 완료되었습니다. 로그인 해주세요.");
        navigate("/login");
      } else {
        alert(res.data.message || "회원가입에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  // 비밀번호 정책
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
            {TEAMS.map((team) => (
              <option key={team.value} value={team.value}>
                {team.label}
              </option>
            ))}
          </select>
        </label>

        {/* 로그인 이동 */}
        <button
          onClick={() => navigate("/login")}
          className="button-border text-gray-600 hover:bg-gray-100 mb-4 w-full h-11"
        >
          ← 로그인 화면으로 돌아가기
        </button>

        {/* 가입 버튼 */}
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
