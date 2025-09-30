// src/components/mypage/TicketSection.tsx
export default function TicketSection() {
  // TODO: 나중에 /api/my-tickets 불러오기
  const tickets = [
    {
      id: 1,
      title: "두산 베어스 vs. LG 트윈스",
      date: "2024.05.15 (금) 18:30",
      price: "25,000원",
      status: "판매중",
    },
    {
      id: 2,
      title: "롯데 자이언츠 vs. 기아 타이거즈",
      date: "2024.05.20 (화) 18:30",
      price: "30,000원",
      status: "판매 완료",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">내가 등록한 티켓</h2>
      <ul className="space-y-4">
        {tickets.map((ticket) => (
          <li
            key={ticket.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{ticket.title}</p>
              <p className="text-sm text-gray-500">{ticket.date}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#6F00B6]">{ticket.price}</p>
              <p className="text-xs text-gray-500">{ticket.status}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
