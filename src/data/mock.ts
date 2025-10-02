import type { GroupUI } from "../types/group";
import type { TicketUI } from "../types/ticket";

export const groupsMock: GroupUI[] = [
  {
    id: 1,
    title: "주말 직관 모임",
    content: "주말에 같이 직관 가실 분 모집합니다!",
    date: "2024-05-20 (토) 18:30",
    stadiumName: "잠실야구장",
    teams: "LG 트윈스 vs 두산 베어스",
    personnel: "5명 모집중",
    leader: "야구좋아",
    status: "모집중",
  },
  {
    id: 2,
    title: "직장인 평일 모임",
    content: "평일에 퇴근 후 직관 모임입니다.",
    date: "2024-06-02 (금) 18:30",
    stadiumName: "광주-기아 챔피언스필드",
    teams: "KIA 타이거즈 vs NC 다이노스",
    personnel: "3명 모집중",
    leader: "티켓나눔",
    status: "모집완료",
  },
];

export const ticketsMockResponse = {
  status: "success",
  message: null,
  data: [
    {
      id: 1,
      title: "LG 트윈스 vs 두산 베어스",
      content: "1루 내야석 2연석 양도합니다.",
      price: 35000,
      gameDate: "2024-05-15T18:30:00",
      ticketCount: 2,
      homeTeam: "LG",
      awayTeam: "두산",
      stadiumName: "잠실야구장",
      adjacentSeat: true,
      status: "판매중",
      imageUrl: "https://placehold.co/400x300",

      seller: {
        id: 101,
        nickname: "야구매니아",
        rate: 4.5,
      },
      buyer: null, // 아직 거래 전
    },
    {
      id: 2,
      title: "롯데 vs 삼성",
      content: "외야 자유석 1매 양도",
      price: 20000,
      gameDate: "2024-05-20T18:30:00",
      ticketCount: 1,
      homeTeam: "롯데",
      awayTeam: "삼성",
      stadiumName: "사직야구장",
      adjacentSeat: false,
      status: "판매완료",
      imageUrl: "https://placehold.co/400x300",

      seller: {
        id: 102,
        nickname: "부산야구짱",
        rate: 4.8,
      },
      buyer: {
        id: 202,
        nickname: "직관러",
      },
    },
  ] as TicketUI[],
};
