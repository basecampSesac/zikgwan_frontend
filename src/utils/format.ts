import { format } from "date-fns";
import { ko } from "date-fns/locale";

const DATE_PLACEHOLDER = "-";

type DateInput = string | Date;

const toValidDate = (value?: DateInput | null): Date | null => {
  if (!value) return null;

  const date = typeof value === "string" ? new Date(value) : value;
  return isNaN(date.getTime()) ? null : date;
};

export const formatDate = (dateStr?: DateInput): string => {
  const date = toValidDate(dateStr);
  if (!date) return DATE_PLACEHOLDER;

  return format(date, "yyyy-MM-dd (EEE) HH:mm", { locale: ko });
};

export const formatPrice = (price: number): string => {
  return price.toLocaleString("ko-KR");
};

export const formatTabDate = (dateStr?: DateInput): string => {
  const date = toValidDate(dateStr);
  if (!date) return DATE_PLACEHOLDER;

  return format(date, "d일 (EEE)", { locale: ko });
};

export const formatNotificationTime = (sentAt?: DateInput): string => {
  const date = toValidDate(sentAt);
  if (!date) return DATE_PLACEHOLDER;

  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);

  if (isToday) {
    if (diffMin < 1) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
  }

  return format(date, "MM.dd HH:mm");
};
