import { useChatWidgetStore } from "../../store/chatWidgetStore";
import ChatPopup from "./ChatPopup";

export default function ChatPopupManager() {
  const { openedRooms } = useChatWidgetStore();

  return (
    <>
      {Object.entries(openedRooms).map(([roomId, roomData], idx) => (
        <ChatPopup
          key={roomId}
          roomId={Number(roomId)}
          title={roomData.roomName}
          offsetX={idx}
        />
      ))}
    </>
  );
}
