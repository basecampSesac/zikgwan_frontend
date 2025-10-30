import { create } from "zustand";

interface OpenedRoom {
  roomName: string;
  leaderNickname?: string;
  memberCount?: number;
}

interface ChatWidgetState {
  isOpen: boolean;
  openedRooms: Record<number, OpenedRoom>;

  openWidget: () => void;
  closeWidget: () => void;

  openPopup: (
    roomId: number,
    roomName: string,
    memberCount?: number,
    leaderNickname?: string
  ) => void;
  closePopup: (roomId: number) => void;

  setLeaderNickname: (roomId: number, leaderNickname: string) => void;
}

export const useChatWidgetStore = create<ChatWidgetState>((set) => ({
  isOpen: false,
  openedRooms: {},

  openWidget: () => {
    set({ isOpen: true });
  },
  closeWidget: () => {
    set({ isOpen: false });
  },

  openPopup: (roomId, roomName, memberCount, leaderNickname) => {
    console.log(
      `[Store] openPopup() 실행됨 → roomId=${roomId}, roomName=${roomName}, leader=${
        leaderNickname ?? "없음"
      }, members=${memberCount ?? "?"}`
    );
    console.trace("openPopup 호출 스택");
    set((state) => ({
      openedRooms: {
        ...state.openedRooms,
        [roomId]: { roomName, leaderNickname, memberCount },
      },
    }));
  },

  closePopup: (roomId) => {
    console.log(`[Store] closePopup() 실행됨 → roomId=${roomId}`);
    set((state) => {
      const updated = { ...state.openedRooms };
      delete updated[roomId];
      return { openedRooms: updated };
    });
  },

  setLeaderNickname: (roomId, leaderNickname) => {
    set((state) => {
      if (!state.openedRooms[roomId]) {
        return state;
      }

      return {
        openedRooms: {
          ...state.openedRooms,
          [roomId]: {
            ...state.openedRooms[roomId],
            leaderNickname,
          },
        },
      };
    });
  },
}));
