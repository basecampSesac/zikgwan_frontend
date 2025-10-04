import { format } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * 날짜 포맷팅 (2024-05-20 (월) 18:30)
 */
export const formatDate = (dateStr: string | Date): string => {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return format(date, "yyyy-MM-dd (EEE) HH:mm", { locale: ko });
};

/**
 * 가격 포맷팅 (35,000)
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString("ko-KR");
};

/**
 * 경기 일정 탭용 날짜 포맷 (20일 (월))
 */
export const formatTabDate = (dateStr: string | Date): string => {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return format(date, "d일 (EEE)", { locale: ko });
};
