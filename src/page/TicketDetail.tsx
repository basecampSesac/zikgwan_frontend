import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TicketDetailView from "../components/tickets/TicketDetailView";
import type { TicketUI } from "../types/ticket";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<TicketUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  useEffect(() => {
    fetch(`${API_URL}/api/tickets/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "데이터를 가져오지 못했습니다.");
        }
        return res.json();
      })
      .then((data) => {
        // ApiResponse<TicketSaleResponse> 구조에서 data 추출
        setTicket(data.data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center mt-10">로딩 중...</div>;
  if (error)
    return (
      <div className="text-center mt-10">
        {error}
      </div>
    );
  if (!ticket)
    return (
      <div className="text-center mt-10">
        해당 정보를 가진 판매글이 존재하지 않습니다.
      </div>
    );

  return <TicketDetailView ticket={ticket} />;
}
