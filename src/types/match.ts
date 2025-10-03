export interface Match {
  date: string; // 경기 날짜
  home: string; // 홈팀 (팀 코드 or 이름)
  away: string; // 어웨이팀
  place: string; // 구장 이름
}

// 날짜별 경기 묶음
export interface MatchDay {
  date: string; // yyyy-mm-dd
  games: Match[]; // 해당 날짜에 열린 경기들
}
