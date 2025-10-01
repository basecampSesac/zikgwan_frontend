export type TicketUI = {
  id: number;
  title: string;
  content?: string;
  price: string;
  gameDate: string;
  ticketCount: number;
  homeTeam: string;
  awayTeam: string;
  stadiumName: string;
  adjacentSeat: boolean;
  seller: {
    nickname: string;
    rate: number;
  };
  imageUrl?: string;
  status: "판매중" | "판매완료";
};
