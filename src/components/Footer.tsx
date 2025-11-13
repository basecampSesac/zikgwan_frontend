// cspell:disable
export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* 로고 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">© 2025 ZIKGWAN Inc.</span>
        </div>

        {/* 링크 */}
        <nav className="flex flex-wrap gap-6 text-sm text-gray-600">
          <a href="/policy" className="hover:text-[#6F00B6]">
            이용약관
          </a>
          <a href="/ticket-guide" className="hover:text-[#6F00B6]">
            티켓 판매 안내
          </a>
        </nav>
      </div>
    </footer>
  );
}
