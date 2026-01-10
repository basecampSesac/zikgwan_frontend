import { memo } from "react";
import TicketCard from "../tickets/TicketCard";
import type { TicketUI } from "../../types/ticket";
import { useApiData } from "../../hooks/useApiData";

const TicketSection = function TicketSection() {
  const { data: tickets, loading } = useApiData<TicketUI[]>(
    "/api/chatroom/chat/ticket/desc",
    {
      errorMessage: "티켓 데이터를 불러오지 못했습니다.",
      transform: (data) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: expected array");
        }
        return data;
      }
    }
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">🔥 채팅 문의 폭주 티켓</h2>

{loading ? (
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tickets && tickets.length > 0 ? (
            tickets.map((ticket) => (
              <TicketCard key={ticket.tsId} {...ticket} />
            ))
          ) : (
            <p className="text-gray-500 text-sm">불러올 티켓이 없습니다.</p>
          )}
        </div>
      )}
    </div>
);
};

export default memo(TicketSection);
