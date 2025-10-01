export type GroupUI = {
  id: number;
  title: string;
  content?: string;
  date: string;
  stadiumName?: string;
  teams: string;
  personnel: string;
  leader: string;
  status: "모집중" | "모집완료";
  imageUrl?: string;
};
