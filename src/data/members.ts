export interface Member {
  id: number;
  nickname: string;
  team: string;
}

export const MOCK_MEMBERS: Member[] = [
  { id: 1, nickname: "롯데팬_지민", team: "롯데 자이언츠" },
  { id: 2, nickname: "두산곰_지현", team: "두산 베어스" },
  { id: 3, nickname: "엘지트윈스_하나", team: "LG 트윈스" },
  { id: 4, nickname: "기아타이거즈_민호", team: "KIA 타이거즈" },
];
