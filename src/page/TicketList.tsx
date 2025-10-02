import SearchPanel from "../components/SearchPanel";
import TicketCard from "../components/tickets/TicketCard";
import TicketDetails from "../components/tickets/TicketForm";
import ListHeader from "../components/ListHeader";
import { ticketsMockResponse } from "../data/mock";

export default function TicketList() {
  const tickets = ticketsMockResponse.data;

  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        등록된 티켓이 없습니다.
      </div>
    );
  }

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
