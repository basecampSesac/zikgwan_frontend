import SearchPanel from "../components/SearchPanel";
import { v4 as uuidv4 } from "uuid";
import GroupCard from "../components/GroupCard";
import ListHeader from "../components/ListHeader";

export default function GroupList() {
  const groups = [
    {
      title: "주말 직관 모임",
      teams: "LG 트윈스 vs 두산 베어스",
      date: "2024.05.20 (토) 18:30",
      location: "잠실야구장",
      personnel: "5명 모집중",
      leader: "야구좋아",
    },
    {
      title: "직장인 평일 모임",
      teams: "KIA 타이거즈 vs. NC 다이노스",
      date: "2024.06.02 (금) 18:30",
      location: "광주-기아 챔피언스필드",
      personnel: "3명 모집중",
      leader: "티켓나눔",
    },
    {
      title: "직장인 평일 모임",
      teams: "KIA 타이거즈 vs. NC 다이노스",
      date: "2024.06.02 (금) 18:30",
      location: "광주-기아 챔피언스필드",
      personnel: "3명 모집중",
      leader: "티켓나눔",
    },
    {
      title: "직장인 평일 모임",
      teams: "KIA 타이거즈 vs. NC 다이노스",
      date: "2024.06.02 (금) 18:30",
      location: "광주-기아 챔피언스필드",
      personnel: "3명 모집중",
      leader: "티켓나눔",
    },
    {
      title: "직장인 평일 모임",
      teams: "KIA 타이거즈 vs. NC 다이노스",
      date: "2024.06.02 (금) 18:30",
      location: "광주-기아 챔피언스필드",
      personnel: "3명 모집중",
      leader: "티켓나눔",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 중앙 레이아웃 컨테이너 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 검색 패널 */}
        <div className="mb-6">
          <SearchPanel title="모임 검색" showPrice={false} />
        </div>

        {/* 리스트 헤더 (공통 컴포넌트 사용) */}
        <ListHeader
          title="모임"
          count={groups.length}
          buttonText="+ 모임 등록"
          sortOptions={["최신순", "인원 많은순", "인원 적은순"]}
        />

        {/* 카드 그리드 */}
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))]">
          {groups.map((item) => (
            <GroupCard key={uuidv4()} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
