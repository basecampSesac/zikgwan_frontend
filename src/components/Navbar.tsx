import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import NotificationDropdown from "../components/NotificationDropdown";

export function Navbar() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  // Zustand 최적화: 필요한 값만 구독
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const userNickname = useAuthStore((state) => state.user?.nickname);

  const handleLogout = async () => {
    try {
      await logout();
      addToast("정상적으로 로그아웃되었습니다.", "success");
      navigate("/login");
    } catch {
      addToast("로그아웃 중 오류가 발생했습니다.", "error");
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full border-b border-gray-200 bg-white/95 backdrop-blur z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <div
          className="text-2xl font-bold text-[#6F00B6] flex items-center gap-1 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src="/logo.png" alt="로고" className="h-8 w-auto mb-1" />
          직관
        </div>

        {/* 메뉴 */}
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
        <div className="flex items-center gap-6 text-base font-semibold text-[#29292D]">
          {isAuthenticated ? (
            <>
              {/* 닉네임 박스 */}
              <div className="flex items-center gap-1 text-gray-700">
                <span className="font-semibold text-[#6F00B6]">
                  {userNickname ? `${userNickname}님,` : ""}
                </span>
                <span>반가워요 👋</span>
              </div>

              <div className="flex items-center gap-6 text-gray-700">
                <button
                  onClick={() => navigate("/mypage")}
                  className="hover:text-[#6F00B6] transition"
                >
                  마이 페이지
                </button>
                <button
                  onClick={handleLogout}
                  className="hover:text-[#6F00B6] transition"
                >
                  로그아웃
                </button>
              </div>

              <NotificationDropdown />
            </>
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