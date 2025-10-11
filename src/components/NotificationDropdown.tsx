import { useState } from "react";
import { FaRegBell } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  nickname: string;
  message: string;
  unread: boolean;
  timestamp: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  // 더미 데이터
  const notifications: Notification[] = [
    {
      id: "1",
      nickname: "롯데팬_민수",
      message: "안녕하세요 티켓 사러 연락드렸는데요...",
      unread: false,
      timestamp: "2025-10-10 13:22",
    },
    {
      id: "2",
      nickname: "두산곰_지현",
      message: "혹시 내일 경기 교환 가능할까요?",
      unread: true,
      timestamp: "2025-10-10 12:58",
    },
  ];

  return (
    <div className="relative">
      {/* 종 아이콘 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-50 rounded-full transition"
      >
        <FaRegBell className="w-6 h-6 text-gray-700" />
        {notifications.some((n) => n.unread) && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* 드롭다운 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-md ring-1 ring-gray-200/60 z-50 overflow-hidden backdrop-blur-md"
          >
            {/* 상단 타이틀 */}
            <div className="px-4 py-3 bg-white/70 border-b border-gray-300/60">
              <h3 className="font-medium text-gray-800 text-sm">새 메시지</h3>
            </div>
            {/* 알림 목록 */}
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 cursor-pointer transition ${
                    n.unread
                      ? "bg-gray-50 hover:bg-gray-100/60"
                      : "hover:bg-gray-50/60"
                  }`}
                >
                  <p className="font-medium text-gray-900 mb-0.5">
                    {n.nickname}
                  </p>
                  <p className="text-sm text-gray-600 truncate leading-snug">
                    {n.message.length > 25
                      ? n.message.slice(0, 25) + "..."
                      : n.message}
                  </p>
                  <span className="text-xs text-gray-400 mt-0.5 block">
                    {n.timestamp || "방금 전"}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
