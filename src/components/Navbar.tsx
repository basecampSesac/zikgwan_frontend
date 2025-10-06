import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 w-full border-b border-gray-200 bg-white/95 backdrop-blur z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <div
          className="text-2xl font-bold text-[#6F00B6] cursor-pointer flex items-center gap-1"
          onClick={() => navigate("/")}
        >
          <img src="/logo.png" alt="로고" className="h-8 w-auto mb-1" />
          직관
        </div>

        {/* 가운데 메뉴 */}
        <nav className="hidden md:flex items-center gap-6 text-base font-semibold text-[#29292D] flex-grow ml-8">
          <button
            onClick={() => navigate("/tickets")}
            className="hover:text-[#6F00B6]"
          >
            티켓 거래
          </button>

          <button
            onClick={() => navigate("/groups")}
            className="hover:text-[#6F00B6]"
          >
            직관 모임
          </button>

          <button
            onClick={() => navigate("/schedule")}
            className="hover:text-[#6F00B6]"
          >
            경기 일정
          </button>
        </nav>

        {/* 오른쪽 영역 */}
        <div className="flex items-center gap-3 text-sm font-medium relative">
          {/* 마이페이지 */}
          <button
            onClick={() =>
              isAuthenticated ? navigate("/mypage") : navigate("/login")
            }
            className="px-4 py-2 border rounded-lg text-[#6F00B6] font-semibold border-gray-200 hover:bg-[#f9f5ff] transition"
          >
            마이페이지
          </button>

          {/* 로그인/회원가입 vs 로그아웃 */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="px-4 py-2 border rounded-lg text-[#6F00B6] font-semibold border-gray-200 hover:bg-[#f9f5ff] transition"
            >
              로그아웃
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 border rounded-lg text-[#6F00B6] font-semibold border-gray-200 hover:bg-[#f9f5ff] transition"
              >
                로그인
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 border rounded-lg text-[#6F00B6] font-medium border-gray-200 hover:bg-[#f9f5ff] transition"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
