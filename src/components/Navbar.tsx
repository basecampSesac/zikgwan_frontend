import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import NotificationDropdown from "../components/NotificationDropdown";

export function Navbar() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const userNickname = useAuthStore((state) => state.user?.nickname);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const openMenu = () => setIsMenuOpen(true);

  const go = (path: string) => {
    navigate(path);
    closeMenu();
  };

  const handleLogout = async () => {
    try {
      await logout();
      addToast("정상적으로 로그아웃되었습니다.", "success");
      closeMenu();
      navigate("/login");
    } catch {
      addToast("로그아웃 중 오류가 발생했습니다.", "error");
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full border-b border-gray-200 bg-white/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="md:hidden">
<button
              type="button"
              onClick={openMenu}
              className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-[#6F00B6]"
              aria-label="메뉴 열기"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="text-gray-700" size={22} />
            </button>
          </div>

          <div
            className="text-2xl font-bold text-[#6F00B6] flex items-center gap-1 cursor-pointer select-none"
            onClick={() => navigate("/")}
          >
            <img src="/logo.png" alt="로고" className="h-8 w-auto mb-1" />
            직관
          </div>

          {/* 메뉴 */}
<nav className="hidden md:flex items-center gap-6 text-base font-semibold text-[#29292D] flex-grow ml-8" role="navigation" aria-label="메인 메뉴">
            <button
              onClick={() => navigate("/tickets")}
              className="hover:text-[#6F00B6] focus:outline-none focus:ring-2 focus:ring-[#6F00B6] focus:ring-offset-2 rounded px-2 py-1"
              aria-label="티켓 거래 페이지로 이동"
            >
              티켓 거래
            </button>
            <button
              onClick={() => navigate("/groups")}
              className="hover:text-[#6F00B6] focus:outline-none focus:ring-2 focus:ring-[#6F00B6] focus:ring-offset-2 rounded px-2 py-1"
              aria-label="직관 모임 페이지로 이동"
            >
              직관 모임
            </button>
            <button
              onClick={() => navigate("/schedule")}
              className="hover:text-[#6F00B6] focus:outline-none focus:ring-2 focus:ring-[#6F00B6] focus:ring-offset-2 rounded px-2 py-1"
              aria-label="경기 일정 페이지로 이동"
            >
              경기 일정
            </button>
          </nav>

          {/* 오른쪽 영역 */}
          <div className="flex items-center gap-3 md:gap-6 text-base font-semibold text-[#29292D]">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-1 text-gray-700">
                  <span className="font-semibold text-[#6F00B6]">
                    {userNickname ? `${userNickname}님,` : ""}
                  </span>
                  <span>반가워요</span>
                </div>

                <div className="hidden md:flex items-center gap-6 text-gray-700">
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
                  className="px-3 md:px-4 py-2 border rounded-lg text-[#6F00B6] font-semibold border-gray-200 hover:bg-[#f9f5ff] transition"
                >
                  로그인
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="hidden md:inline-flex px-4 py-2 border rounded-lg text-[#6F00B6] font-medium border-gray-200 hover:bg-[#f9f5ff] transition"
                >
                  회원가입
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Overlay */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={closeMenu}
            aria-label="메뉴 닫기"
          />

          <aside className="absolute top-0 left-0 h-full w-[84%] max-w-[320px] bg-white shadow-xl flex flex-col">
            <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => go("/")}
              >
                <img src="/logo.png" alt="로고" className="h-7 w-auto" />
                <span className="text-lg font-bold text-[#6F00B6]">직관</span>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
                aria-label="메뉴 닫기"
              >
                <X className="text-gray-700" size={22} />
              </button>
            </div>

            <div className="px-4 py-4 border-b border-gray-100">
              {isAuthenticated ? (
                <div className="text-gray-700">
                  <div className="text-sm text-gray-500">환영합니다</div>
                  <div className="mt-1 text-base font-semibold">
                    <span className="text-[#6F00B6]">
                      {userNickname ?? "회원"}
                    </span>
                    님
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => go("/login")}
                    className="flex-1 h-10 border rounded-lg text-[#6F00B6] font-semibold border-gray-200 hover:bg-[#f9f5ff] transition"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => go("/signup")}
                    className="flex-1 h-10 border rounded-lg text-[#6F00B6] font-medium border-gray-200 hover:bg-[#f9f5ff] transition"
                  >
                    회원가입
                  </button>
                </div>
              )}
            </div>

            <nav className="px-2 py-3">
              <button
                onClick={() => go("/tickets")}
                className="w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-800 font-semibold"
              >
                티켓 거래
              </button>
              <button
                onClick={() => go("/groups")}
                className="w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-800 font-semibold"
              >
                직관 모임
              </button>
              <button
                onClick={() => go("/schedule")}
                className="w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-800 font-semibold"
              >
                경기 일정
              </button>
            </nav>

            {isAuthenticated && (
              <div className="mt-auto px-2 pb-4">
                <div className="px-3 pt-2 pb-3 text-xs font-semibold text-gray-400">
                  계정
                </div>
                <button
                  onClick={() => go("/mypage")}
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-800 font-semibold"
                >
                  마이 페이지
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-800 font-semibold"
                >
                  로그아웃
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
