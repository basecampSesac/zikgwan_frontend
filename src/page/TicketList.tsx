import { useState } from "react";
import SearchPanel from "../components/SearchPanel";
import TicketCard from "../components/tickets/TicketCard";
import TicketForm from "../components/tickets/TicketForm";
import ListHeader from "../components/ListHeader";
import Modal from "../components/Modal";
import { ticketsMockResponse } from "../data/mock";

export default function TicketList() {
  const tickets = ticketsMockResponse.data;
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

        {/* 리스트 헤더 + 티켓 등록 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <ListHeader
            title="티켓"
            count={tickets.length}
            sortOptions={["최신순", "낮은 가격순", "높은 가격순"]}
            buttonText="+ 티켓 등록"
            onButtonClick={() => setIsCreateOpen(true)} // ✅
          />
        </div>

        {/* 카드 그리드 */}
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))]">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} {...ticket} />
          ))}
        </div>
      </div>

      {/* 등록 모달 */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <TicketForm mode="create" onClose={() => setIsCreateOpen(false)} />
      </Modal>
    </div>
  );
}
