import SearchPanel from "../components/SearchPanel";
import TicketCard from "../components/tickets/TicketCard";
import TicketDetails from "../components/tickets/TicketDetails";
import ListHeader from "../components/ListHeader";
import type { TicketUI } from "../types/ticket";

export default function TicketList() {
  const tickets: TicketUI[] = [
    {
      id: 1,
      title: "LG 트윈스 vs 두산 베어스",
      content: "1루 내야석 2연석",
      price: "35,000원",
      gameDate: "2024-05-15 (수) 18:30",
      ticketCount: 2,
      homeTeam: "LG",
      awayTeam: "두산",
      stadiumName: "잠실야구장",
      adjacentSeat: true,
      seller: { nickname: "야구매니아", rate: 3.5 },
      status: "판매중",
    },
    {
      id: 2,
      title: "롯데 vs 삼성",
      content: "외야 자유석 양도",
      price: "20,000원",
      gameDate: "2024-05-20 (월) 18:30",
      ticketCount: 1,
      homeTeam: "롯데",
      awayTeam: "삼성",
      stadiumName: "사직야구장",
      adjacentSeat: false,
      seller: { nickname: "부산야구짱", rate: 4.8 },
      status: "판매완료",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 검색 패널 */}
        <div className="mb-6">
          <SearchPanel title="티켓 검색" showPrice={true} />
        </div>

        {/* 리스트 헤더 + 티켓 등록 */}
        <div className="flex justify-between items-center mb-6">
          <ListHeader
            title="티켓"
            count={tickets.length}
            sortOptions={["최신순", "낮은 가격순", "높은 가격순"]}
            buttonText="+ 티켓 등록"
            modalChildren={<TicketDetails />}
          />
        </div>

        {/* 카드 그리드 */}
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))]">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} {...ticket} />
          ))}
        </div>
      </div>
    </div>
  );
}
