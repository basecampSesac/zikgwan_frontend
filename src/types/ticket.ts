// 판매자 / 구매자 공통 타입
export type UserInfo = {
  id: number;
  nickname: string;
  rate?: number; // 평점은 판매자 쪽에만 의미 있을 수도 있음
};

// 티켓 UI 타입
export type TicketUI = {
  id: number;
  title: string;
  content?: string;
  price: number;
  gameDate: string;
  ticketCount: number;
  homeTeam: string;
  awayTeam: string;
  stadiumName: string;
  adjacentSeat: boolean;
  status: "판매중" | "판매완료";
  imageUrl?: string;

  // 임시 확장
  seller: UserInfo;
  buyer?: UserInfo | null; // 거래가 안 되었으면 null
};
