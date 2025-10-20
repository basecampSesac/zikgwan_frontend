export const TEAMS = [
  { value: "두산 베어스", label: "두산 베어스" },
  { value: "롯데 자이언츠", label: "롯데 자이언츠" },
  { value: "삼성 라이온즈", label: "삼성 라이온즈" },
  { value: "SSG 랜더스", label: "SSG 랜더스" },
  { value: "키움 히어로즈", label: "키움 히어로즈" },
  { value: "KT 위즈", label: "KT 위즈" },
  { value: "NC 다이노스", label: "NC 다이노스" },
  { value: "LG 트윈스", label: "LG 트윈스" },
  { value: "기아 타이거즈", label: "기아 타이거즈" },
  { value: "한화 이글스", label: "한화 이글스" },
];

export type TeamValue = (typeof TEAMS)[number]["value"];
