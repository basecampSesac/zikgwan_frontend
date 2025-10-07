import { useParams } from "react-router-dom";
import { groupsMock } from "../data/mock";
import GroupDetailView from "../components/groups/GroupDetailView";

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const group = groupsMock.find((g) => g.id === Number(id));

  if (!group) {
    return <div className="p-10 text-center">존재하지 않는 모임입니다 ❌</div>;
  }

  return <GroupDetailView />;
}
