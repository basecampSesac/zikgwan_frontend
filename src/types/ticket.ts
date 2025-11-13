export type UserInfo = {
  id?: number;
  nickname: string;
  rate?: number | null;
};

export type TicketUI = {
  tsId: number;
  title: string;
  description: string;
  price: number;
  gameDay: string;
  ticketCount: number;
  home: string;
  away: string;
  stadium: string;
  adjacentSeat: "Y" | "N";
  nickname: string;
  imageUrl?: string;
  rating: number | null;
  profileImageUrl?: string;
  state: string;
  createdAt: string;
  updatedAt: string;
};

export type CompletedTicket = {
  tsId: number;
  title: string;
  price: number;
  home: string;
  away: string;
  stadium: string;
  state: "END" | "ING";
  sellerId: number;
  buyerId: number;
  updatedAt: string | null;
  rating: number | null;
  sellerNickname: string;
  gameDay: string | null;
};
