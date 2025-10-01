export const TEAMS = [
  { value: "두산", label: "두산 베어스" },
  { value: "롯데", label: "롯데 자이언츠" },
  { value: "삼성", label: "삼성 라이온즈" },
  { value: "SSG", label: "SSG 랜더스" },
  { value: "키움", label: "키움 히어로즈" },
  { value: "KT", label: "KT 위즈" },
  { value: "NC", label: "NC 다이노스" },
  { value: "LG", label: "LG 트윈스" },
  { value: "기아", label: "기아 타이거즈" },
  { value: "한화", label: "한화 이글스" },
];

export type TeamValue = (typeof TEAMS)[number]["value"];
