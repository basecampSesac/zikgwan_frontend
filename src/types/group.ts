// 공통 기본 필드
export interface CommunityBase {
  communityId: number;
  title: string;
  description: string;
  date: string;
  memberCount: number;
  stadium: string;
  home: string;
  away: string;
  nickname: string;
  state: "ING" | "DONE";
  userId?: number;
}

// 목록, 검색용 /api/communities, /api/communities/search
export type CommunityItem = CommunityBase;

// 상세 조회용 /api/communities/{id}
export interface CommunityDetail extends CommunityBase {
  saveState: "Y" | "N";
  createdAt: string;
  updatedAt: string;
}

// 프론트 UI 전용 타입
export interface GroupUI {
  id: number;
  title: string;
  content?: string;
  date: string;
  time?: string;
  stadiumName?: string;
  teams: string;
  personnel: number;
  leader: string;
  status: "모집중" | "모집마감";
  imageUrl?: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 공통 API 응답 타입 모든 axios 요청에서 재사용 가능
export interface ApiResponse<T> {
  status: "success" | "error";
  message: string | null;
  data: T;
}
