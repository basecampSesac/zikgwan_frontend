export type UserInfo = {
  id?: number;
  nickname: string;
  rate?: number | null;
};

export type TicketUI = {
  id: number;
  title: string;
  description?: string;
  price: number;
  gameDate: string;
  ticketCount: number;
  stadiumName: string;
  status: "판매중" | "판매완료";
  imageUrl?: string;

  seller: UserInfo;
};
