import { useEffect, useState } from "react";
import TicketCard from "../tickets/TicketCard";
import type { TicketUI } from "../../types/ticket";
// ✅ 더미 데이터 import
import { ticketsMockResponse } from "../../data/mock";

export default function TicketSection() {
  const [tickets, setTickets] = useState<TicketUI[]>([]);

  useEffect(() => {
    // ✅ 실제 API 대신 더미 데이터 세팅
    setTickets(ticketsMockResponse.data);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">🔥 채팅 문의 폭주 티켓</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {tickets.length > 0 ? (
          tickets.map((ticket) => <TicketCard key={ticket.id} {...ticket} />)
        ) : (
          <p className="text-gray-500 text-sm">불러올 티켓이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
