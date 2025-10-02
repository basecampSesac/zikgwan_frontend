import { useParams } from "react-router-dom";
import TicketDetailView from "../components/tickets/TicketDetailView";
import type { TicketUI } from "../types/ticket";
import { ticketsMockResponse } from "../data/mock";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const ticket: TicketUI | undefined = ticketsMockResponse.data.find(
    (t) => t.id === Number(id)
  );

  if (!ticket) {
    return (
      <div className="text-center mt-10">
        해당 정보를 가진 판매글이 존재하지 않습니다.
      </div>
    );
  }

  return <TicketDetailView ticket={ticket} />;
}
