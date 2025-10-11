// 풀네임 리스트 (UI에서 선택할 때 사용)
export const STADIUMS: string[] = [
  "광주-기아 챔피언스 필드",
  "대구 삼성 라이온즈 파크",
  "서울종합운동장 야구장",
  "수원 케이티 위즈 파크",
  "SSG 랜더스필드",
  "사직 야구장",
  "대전 한화생명 볼파크",
  "창원 NC파크",
  "고척 스카이돔",
];

// API 응답 → 풀네임 매핑
export const STADIUM_MAP: Record<string, string> = {
  잠실: "서울종합운동장 야구장",
  문학: "SSG 랜더스필드",
  사직: "사직 야구장",
  수원: "수원 케이티 위즈 파크",
  광주: "광주-기아 챔피언스 필드",
  대구: "대구 삼성 라이온즈 파크",
  대전: "대전 한화생명 볼파크",
  창원: "창원 NC파크",
  고척: "고척 스카이돔",
};

// 구장별 기본 이미지 매핑
export const STADIUM_IMAGE_MAP: Record<string, string> = {
  "서울종합운동장 야구장": "/jamsil.jpg",
  "SSG 랜더스필드": "/incheon.jpg",
  "사직 야구장": "/busan.jpg",
  "수원 케이티 위즈 파크": "/suwon.jpg",
  "광주-기아 챔피언스 필드": "/gwangju.jpg",
  "대구 삼성 라이온즈 파크": "/daegu.jpg",
  "대전 한화생명 볼파크": "/daejeon.jpg",
  "창원 NC파크": "/changwon.jpg",
  "고척 스카이돔": "/gocheok.jpg",
};

// 홈팀명으로 기본 이미지 반환 함수
export const getDefaultStadiumImage = (stadiumName?: string): string => {
  if (!stadiumName) return "/default_stadium.jpg";
  return STADIUM_IMAGE_MAP[stadiumName] || "/default_stadium.jpg";
};
