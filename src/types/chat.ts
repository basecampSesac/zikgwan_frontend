// 공통 API 응답
export interface ApiResponse<T> {
  status: string;
  message?: string | null;
  data: T;
}

// 채팅 관련
export interface ChatListItem {
  roomId: number;
  roomName: string;
  lastMessage: string;
  unreadCount: number;
  type?: "C" | "T"; // RoomType 구분 필드
}

// 모임 / 티켓 관련
export interface CommunityItem {
  communityId: number;
  title: string;
  nickname: string;
}

export interface TicketItem {
  ticketId: number;
  title: string;
  nickname: string;
}
