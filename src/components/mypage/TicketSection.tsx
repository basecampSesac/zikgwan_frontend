import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axiosInstance";

interface Ticket {
  id: number;
  title: string;
  date: string;
  price: number;
  status: string;
}

export default function TicketSection() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axiosInstance.get("/api/my-tickets");
        setTickets(res.data.data); // 백엔드 응답 구조에 맞춰 수정 필요
      } catch (error) {
        console.error("내 티켓 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <p>불러오는 중...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">내가 등록한 티켓</h2>
      {tickets.length === 0 ? (
        <p className="text-gray-500">등록한 티켓이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {tickets.map((ticket) => (
            <li
              key={ticket.id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{ticket.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(ticket.date).toLocaleDateString()}{" "}
                  {new Date(ticket.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#6F00B6]">
                  {ticket.price.toLocaleString()}원
                </p>
                <p className="text-xs text-gray-500">{ticket.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
