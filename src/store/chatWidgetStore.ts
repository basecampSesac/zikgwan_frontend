import { create } from "zustand";

interface ChatWidgetState {
  isOpen: boolean; // 위젯 열림 여부
  activeRoomId: number | null; // 위젯 내부에서 열려 있는 방
  openedRooms: Record<number, string>; // 팝업으로 열린 방 목록

  openWidget: () => void;
  closeWidget: () => void;
  setActiveRoomId: (roomId: number | null) => void;
  openPopup: (roomId: number, title: string) => void; // title 추가
  closePopup: (roomId: number) => void;
}

export const useChatWidgetStore = create<ChatWidgetState>((set) => ({
  isOpen: false,
  activeRoomId: null,
  openedRooms: {},

  openWidget: () => set({ isOpen: true }),
  closeWidget: () => set({ isOpen: false }),
  setActiveRoomId: (roomId) => set({ activeRoomId: roomId }),

  // 팝업 열기
  openPopup: (roomId, title) =>
    set((state) => ({
      openedRooms: { ...state.openedRooms, [roomId]: title },
    })),

  // 팝업 닫기 (삭제)
  closePopup: (roomId) =>
    set((state) => {
      const updated = { ...state.openedRooms };
      delete updated[roomId];
      return { openedRooms: updated };
    }),
}));
