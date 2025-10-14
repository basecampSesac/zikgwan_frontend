import { useChatWidgetStore } from "../../store/chatWidgetStore";
import ChatPopup from "./ChatPopup";

export default function ChatPopupManager() {
  const { openedRooms } = useChatWidgetStore();

  return (
    <>
      {openedRooms.map((roomId, idx) => (
        <ChatPopup
          key={`${roomId}-${idx}`}
          roomId={roomId}
          offsetX={idx * 40}
        />
      ))}
    </>
  );
}
