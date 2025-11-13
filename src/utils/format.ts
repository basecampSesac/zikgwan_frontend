import { format } from "date-fns";
import { ko } from "date-fns/locale";

// 📅 날짜 포맷팅 (2024-05-20 (월) 18:30)
export const formatDate = (dateStr?: string | Date): string => {
  if (!dateStr) return "-";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "-";
  return format(date, "yyyy-MM-dd (EEE) HH:mm", { locale: ko });
};

// 💰 가격 포맷팅 (35,000)
export const formatPrice = (price: number): string => {
  return price.toLocaleString("ko-KR");
};

// 📅 경기 일정 탭용 날짜 포맷 (20일 (월))
export const formatTabDate = (dateStr: string | Date): string => {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return format(date, "d일 (EEE)", { locale: ko });
};

// 🔔 알림 시간 포맷
// 오늘: "방금 전" / "5분 전" / "2시간 전"
// 어제 포함 과거: "10.18 16:20"
export const formatNotificationTime = (sentAt: string | Date): string => {
  const date = typeof sentAt === "string" ? new Date(sentAt) : sentAt;
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);

  // 오늘인 경우: 상대시간
  if (isToday) {
    if (diffMin < 1) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
  }

  // 어제 포함 과거는 고정 포맷
  return format(date, "MM.dd HH:mm");
};
