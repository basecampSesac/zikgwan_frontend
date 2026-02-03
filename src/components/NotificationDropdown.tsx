import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaRegBell } from "react-icons/fa6";
import { FiTrash2 } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { formatNotificationTime } from "../utils/format";
import { useChatWidgetStore } from "../store/chatWidgetStore";

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
  const { hasUnread, markAllRead } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { openPopup } = useChatWidgetStore();
  const api = useApi();

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
      const res = await api.get<{ status: string; data: Notification[] }>(
        `/api/notification/all`,
        { key: "notification-list" }
      );
      if (res.status === "success") {
        // 최신순 정렬
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        );
        setServerNotifications(sorted);
      }
    } catch (err: any) {
      if (err?.name === "CanceledError") return;
    }
  }, [user]);

  // 알림 읽음 처리 및 채팅방 열기
  const markAsRead = async (roomId: number, id: number) => {
    if (!user) return;
    try {
      await api.patch(`/api/notification/read/${id}`, undefined, { key: `notification-read-${id}` });
      setServerNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );

      const res = await api.get<{ status: string; data: { roomId: number; roomName: string } }>(
        `/api/chatroom/detail/${roomId}`,
        { key: `chatroom-open-${roomId}` }
      );

      if (res.status === "success") {
        openPopup(res.data.roomId, res.data.roomName);
      }
    } catch (err: any) {
      if (err?.name === "CanceledError") return;
    }
  };

  // 알림 낱개 삭제
  const deleteNotification = async (id: number) => {
    if (!user) return;
    try {
      await api.del(`/api/notification/${id}`, { key: `notification-delete-${id}` });
      setServerNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      if (err?.name === "CanceledError") return;
    }
  };

  // 알림 전체 삭제
  const deleteAllNotifications = async () => {
    if (!user || serverNotifications.length === 0) return;
    try {
      await Promise.all(
        serverNotifications.map((n) =>
          api.del(`/api/notification/${n.id}`, { key: `notification-delete-all-${n.id}` }).catch(() => null)
        )
      );
      setServerNotifications([]);
    } catch (err: any) {
      if (err?.name === "CanceledError") return;
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
              <h3 className="font-medium text-gray-800 text-sm">
                새 메시지
                {serverNotifications.length > 0 && (
                  <span className="text-gray-400 text-xs ml-1">
                    ({serverNotifications.length})
                  </span>
                )}
              </h3>

              {/* 전체 삭제 버튼 */}
              <button
                onClick={deleteAllNotifications}
                className="text-xs font-semibold text-[#6F00B6] hover:text-[#57008f] transition"
              >
                전체삭제
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
                    onClick={() => markAsRead(n.roomId, n.id)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-[14px] text-gray-900 mb-0.5">
                        {n.senderNickname}
                      </p>
                      <p className="text-sm text-gray-600 text-[13px] leading-snug truncate max-w-[230px]">
                        {n.message.length > 25
                          ? n.message.slice(0, 25) + "..."
                          : n.message}
                      </p>
                      <span className="text-xs text-gray-400 mt-0.5 block mt-1">
                        {formatNotificationTime(n.sentAt)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition mt-5"
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
