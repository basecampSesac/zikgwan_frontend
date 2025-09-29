import SearchPanel from "../components/SearchPanel";
import { v4 as uuidv4 } from "uuid";
import TicketCard from "../components/TicketCard";
import ListHeader from "../components/ListHeader";

export default function List() {
  const data = [
    {
      title: "LG 트윈스 vs. 두산 베어스",
      date: "2024.05.15 (금) 18:30",
      price: "35,000",
      location: "잠실야구장",
      user: "야구매니아",
      rate: 3.5,
    },
    {
      title: "LG 트윈스 vs. 두산 베어스",
      date: "2024.05.15 (금) 18:30",
      price: "35,000",
      location: "잠실야구장",
      user: "야구매니아",
      rate: 3.5,
    },
    {
      title: "LG 트윈스 vs. 두산 베어스",
      date: "2024.05.15 (금) 18:30",
      price: "35,000",
      location: "잠실야구장",
      user: "야구매니아",
      rate: 3.5,
    },
    {
      title: "LG 트윈스 vs. 두산 베어스",
      date: "2024.05.15 (금) 18:30",
      price: "35,000",
      location: "잠실야구장",
      user: "야구매니아",
      rate: 3.5,
    },
    {
      title: "LG 트윈스 vs. 두산 베어스",
      date: "2024.05.15 (금) 18:30",
      price: "35,000",
      location: "잠실야구장",
      user: "야구매니아",
      rate: 3.5,
    },
    {
      title: "LG 트윈스 vs. 두산 베어스",
      date: "2024.05.15 (금) 18:30",
      price: "35,000",
      location: "잠실야구장",
      user: "야구매니아",
      rate: 3.5,
    },
    {
      title: "LG 트윈스 vs. 두산 베어스",
      date: "2024.05.15 (금) 18:30",
      price: "35,000",
      location: "잠실야구장",
      user: "야구매니아",
      rate: 3.5,
    },
    {
      title: "LG 트윈스 vs. 두산 베어스",
      date: "2024.05.15 (금) 18:30",
      price: "35,000",
      location: "잠실야구장",
      user: "야구매니아",
      rate: 3.5,
    },
    {
      title: "LG 트윈스 vs. 두산 베어스",
      date: "2024.05.15 (금) 18:30",
      price: "35,000",
      location: "잠실야구장",
      user: "야구매니아",
      rate: 3.5,
    },
    {
      title: "LG 트윈스 vs. 두산 베어스",
      date: "2024.05.15 (금) 18:30",
      price: "35,000",
      location: "잠실야구장",
      user: "야구매니아",
      rate: 3.5,
    },
    {
      title: "LG 트윈스 vs. 두산 베어스",
      date: "2024.05.15 (금) 18:30",
      price: "35,000",
      location: "잠실야구장",
      user: "야구매니아",
      rate: 3.5,
    },
    {
      title: "LG 트윈스 vs. 두산 베어스",
      date: "2024.05.15 (금) 18:30",
      price: "35,000",
      location: "잠실야구장",
      user: "야구매니아",
      rate: 3.5,
    },
    {
      title: "LG 트윈스 vs. 두산 베어스",
      date: "2024.05.15 (금) 18:30",
      price: "35,000",
      location: "잠실야구장",
      user: "야구매니아",
      rate: 3.5,
    },

    // 더미 데이터 반복...
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 중앙 레이아웃 컨테이너 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 검색 패널 */}
        <div className="mb-6">
          <SearchPanel title="티켓 검색" showPrice={true} />
        </div>

        {/* 리스트 헤더 (총 개수 + 정렬 + 등록 버튼) */}
        <ListHeader
          title="티켓"
          count={data.length}
          buttonText="+ 티켓 등록"
          sortOptions={["최신순", "낮은 가격순", "높은 가격순"]}
        />

        {/* 카드 그리드 */}
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))]">
          {data.map((item) => (
            <TicketCard key={uuidv4()} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
