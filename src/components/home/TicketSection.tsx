import { useEffect, useState } from "react";
import TicketCard from "../tickets/TicketCard";
import type { TicketUI } from "../../types/ticket";
import axiosInstance from "../../lib/axiosInstance";
import { useToastStore } from "../../store/toastStore";

export default function TicketSection() {
  const [tickets, setTickets] = useState<TicketUI[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);

        const { data } = await axiosInstance.get(
          "/api/chatroom/chat/ticket/desc"
        );

        if (data.status === "success" && Array.isArray(data.data)) {
          setTickets(data.data);
        } else {
          addToast("티켓 데이터를 불러오지 못했습니다.", "error");
        }
      } catch (error) {
        console.error("🚨 티켓 데이터 로드 실패:", error);
        addToast("서버와 연결할 수 없습니다.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [addToast]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">🔥 채팅 문의 폭주 티켓</h2>

      {loading ? (
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tickets.length > 0 ? (
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
}
