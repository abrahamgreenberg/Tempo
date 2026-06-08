import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import {
  addItemToBoard,
  deleteColumnFromBoard,
  deleteItemFromBoard,
  moveItemInBoard,
  updateColumnInBoard,
  updateItemInBoard,
} from "@/lib/board-state"
import type { AppState, Column, ItemUpdate, NewItem } from "@/types/domain"

const initialState: AppState = {
  columns: {
    "1a2b3c4d5e6f7g8h9i0j": {
      id: "1a2b3c4d5e6f7g8h9i0j",
      name: "Morning",
      startTime: "09:00",
      endTime: "12:00",
      position: 0,
      date: "2025-01-01",
      itemIds: ["abc1def2ghi3jkl4mno5"],
    },
    "2k3l4m5n6o7p8q9r0s1t": {
      id: "2k3l4m5n6o7p8q9r0s1t",
      name: "Afternoon",
      startTime: "14:00",
      endTime: "17:00",
      position: 1,
      date: "2025-01-01",
      itemIds: ["ghi2jkl3mno4pqr5stu6"],
    },
    "3u4v5w6x7y8z9a0b1c2d": {
      id: "3u4v5w6x7y8z9a0b1c2d",
      name: "Evening",
      startTime: "18:00",
      endTime: "20:00",
      position: 2,
      date: "2025-01-01",
      itemIds: ["pqr6stu7vwx8yz9abc0def"],
    },
  },
  items: {
    abc1def2ghi3jkl4mno5: {
      id: "abc1def2ghi3jkl4mno5",
      name: "Morning Routine",
      durationMinutes: 60,
    },
    pqr6stu7vwx8yz9abc0def: {
      id: "pqr6stu7vwx8yz9abc0def",
      name: "Study Block",
      durationMinutes: 120,
    },
    ghi2jkl3mno4pqr5stu6: {
      id: "ghi2jkl3mno4pqr5stu6",
      name: "Wrap-up",
      durationMinutes: 30,
    },
  },
}

interface BoardStore extends AppState {
  // Actions
  addItem: (item: NewItem, id: string) => void
  updateItem: (id: string, updates: ItemUpdate) => void
  deleteItem: (id: string) => void
  addColumn: (column: Omit<Column, "id" | "itemIds">, id: string) => void
  updateColumn: (id: string, updates: Partial<Column>) => void
  deleteColumn: (id: string) => void
  moveItem: (
    itemId: string,
    fromColumn: string,
    toColumn: string,
    toIndex: number
  ) => void
}

export const useBoardStore = create<BoardStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        addItem: (item, id) =>
          set((state) =>
            addItemToBoard(state, {
              item: { ...item, id },
              listId: item.listId,
            })
          ),

        updateItem: (id, updates) =>
          set((state) => updateItemInBoard(state, id, updates)),

        deleteItem: (id) => set((state) => deleteItemFromBoard(state, id)),

        addColumn: (column, id) =>
          set((state) => ({
            ...state,
            columns: {
              ...state.columns,
              [id]: { ...column, id, itemIds: [] },
            },
          })),

        updateColumn: (id, updates) =>
          set((state) => updateColumnInBoard(state, id, updates)),

        deleteColumn: (id) => set((state) => deleteColumnFromBoard(state, id)),

        moveItem: (itemId, fromColumn, toColumn, toIndex) =>
          set((state) =>
            moveItemInBoard(state, { itemId, fromColumn, toColumn, toIndex })
          ),
      }),
      {
        name: "tempo-board-storage",
      }
    )
  )
)

// Selectors for performance optimization
export const selectColumn = (id: string) => (state: BoardStore) =>
  state.columns[id]
export const selectItem = (id: string) => (state: BoardStore) => state.items[id]
export const selectAllColumns = (state: BoardStore) => state.columns
export const selectAllItems = (state: BoardStore) => state.items
