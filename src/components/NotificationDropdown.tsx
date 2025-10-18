import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaRegBell } from "react-icons/fa6";
import { FiTrash2 } from "react-icons/fi";
import axiosInstance from "../lib/axiosInstance";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";

interface Notification {
  id: number;
  roomId: number;
  message: string;
  readAt: string | null;
  senderNickname: string;
  sentAt: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [serverNotifications, setServerNotifications] = useState<
    Notification[]
  >([]);
  const { user } = useAuthStore();
  const { notifications, hasUnread, markAllRead } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      )
        return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 서버 알림 목록 조회
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.get(`/api/notification/all`);
      if (res.data.status === "success") {
        setServerNotifications(res.data.data);
      }
    } catch (err) {
      console.error("알림 목록 조회 실패:", err);
    }
  }, [user]);

  // 알림 읽음 처리
  const markAsRead = async (id: number) => {
    if (!user) return;
    try {
      await axiosInstance.patch(`/api/notification/read/${id}`);
      setServerNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
    } catch (err) {
      console.error("알림 읽음 처리 실패:", err);
    }
  };

  // 알림 삭제 처리
  const deleteNotification = async (id: number) => {
    if (!user) return;
    try {
      await axiosInstance.delete(`/api/notification/${id}`);
      setServerNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("알림 삭제 실패:", err);
    }
  };

  // 드롭다운 열릴 때 서버 알림 갱신 + 빨간 점 해제
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      markAllRead();
    }
  }, [isOpen, fetchNotifications, markAllRead]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 종 아이콘 */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 hover:bg-gray-50 rounded-full transition"
      >
        <FaRegBell className="w-6 h-6 text-gray-700" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
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
            <div className="px-4 py-3 bg-white/70 border-b border-gray-300/60 flex justify-between items-center">
              <h3 className="font-medium text-gray-800 text-sm">새 메시지</h3>
              <button
                onClick={fetchNotifications}
                className="text-xs text-gray-400 hover:text-gray-600 transition"
              >
                새로고침
              </button>
            </div>

            <ul className="max-h-80 overflow-y-auto">
              {serverNotifications.length === 0 ? (
                <li className="px-4 py-6 text-center text-gray-400 text-sm">
                  새로운 알림이 없습니다.
                </li>
              ) : (
                serverNotifications.map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 flex items-start justify-between gap-3 transition ${
                      !n.readAt
                        ? "bg-gray-50 hover:bg-gray-100/60"
                        : "hover:bg-gray-50/60"
                    }`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-0.5">
                        {n.senderNickname}
                      </p>
                      <p className="text-sm text-gray-600 truncate leading-snug">
                        {n.message.length > 25
                          ? n.message.slice(0, 25) + "..."
                          : n.message}
                      </p>
                      <span className="text-xs text-gray-400 mt-0.5 block">
                        {new Date(n.sentAt).toLocaleString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition"
                      title="삭제"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
