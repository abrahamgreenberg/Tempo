import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { move } from "@dnd-kit/helpers"
import {
  addItemToBoard,
  deleteColumnFromBoard,
  deleteItemFromBoard,
  updateColumnInBoard,
  updateItemInBoard,
  createColumnItemsMap,
} from "@/lib/board-state"
import { calculateItemTimes, Time } from "@/lib/utils"
import type {
  AppState,
  Column,
  ItemUpdate,
  NewItem,
  ItemTimes,
} from "@/types/domain"

/**
 * Calculate times for items in a specific column
 * This is the core logic used by both calculateAllItemTimes and recalculateColumnItemTimes
 */
function calculateColumnItemTimes(
  state: AppState,
  columnId: string
): Record<string, ItemTimes> {
  const column = state.columns[columnId]
  if (!column) return {}

  const columnTimes: Record<string, ItemTimes> = {}

  column.itemIds.forEach((itemId, index) => {
    const item = state.items[itemId]
    if (item) {
      const precedingItemsDuration = column.itemIds
        .slice(0, index)
        .reduce((sum, id) => sum + (state.items[id]?.durationMinutes || 0), 0)

      columnTimes[itemId] = calculateItemTimes(
        column.startTime,
        item.durationMinutes,
        precedingItemsDuration
      )
    }
  })

  return columnTimes
}

/**
 * Calculate all item times for the current state
 * Uses the shared column calculation logic
 */
function calculateAllItemTimes(state: AppState): Record<string, ItemTimes> {
  const itemTimes: Record<string, ItemTimes> = {}

  Object.keys(state.columns).forEach((columnId) => {
    Object.assign(itemTimes, calculateColumnItemTimes(state, columnId))
  })

  return itemTimes
}

const baseInitialState = {
  columns: {
    "1a2b3c4d5e6f7g8h9i0j": {
      id: "1a2b3c4d5e6f7g8h9i0j",
      name: "Morning",
      startTime: new Time(9, 0),
      endTime: new Time(12, 0),
      position: 0,
      date: "2025-01-01",
      itemIds: ["abc1def2ghi3jkl4mno5"],
    },
    "2k3l4m5n6o7p8q9r0s1t": {
      id: "2k3l4m5n6o7p8q9r0s1t",
      name: "Afternoon",
      startTime: new Time(14, 0),
      endTime: new Time(17, 0),
      position: 1,
      date: "2025-01-01",
      itemIds: ["ghi2jkl3mno4pqr5stu6"],
    },
    "3u4v5w6x7y8z9a0b1c2d": {
      id: "3u4v5w6x7y8z9a0b1c2d",
      name: "Evening",
      startTime: new Time(18, 0),
      endTime: new Time(20, 0),
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

const initialState: AppState = {
  ...baseInitialState,
  itemTimes: calculateAllItemTimes(baseInitialState as unknown as AppState),
}

interface BoardStore extends AppState {
  // Actions
  addItem: (item: NewItem, id: string) => void
  updateItem: (id: string, updates: ItemUpdate) => void
  deleteItem: (id: string) => void
  addColumn: (column: Omit<Column, "id" | "itemIds">, id: string) => void
  updateColumn: (id: string, updates: Partial<Column>) => void
  deleteColumn: (id: string) => void
  handleDragOver: (event: Parameters<typeof move>[1]) => void
  recalculateColumnTimes: (columnId: string) => void
}

/**
 * Find which column contains an item
 */
function findColumnContainingItem(
  state: AppState,
  itemId: string
): string | null {
  for (const [columnId, column] of Object.entries(state.columns)) {
    if (column.itemIds.includes(itemId)) {
      return columnId
    }
  }
  return null
}

/**
 * Recalculate times for specific columns only (not all columns)
 * More efficient than recalculating everything
 */
function recalculateColumnItemTimes(
  state: AppState,
  columnIds: string[]
): AppState {
  const newItemTimes = { ...state.itemTimes }

  columnIds.forEach((columnId) => {
    Object.assign(newItemTimes, calculateColumnItemTimes(state, columnId))
  })

  return {
    ...state,
    itemTimes: newItemTimes,
  }
}

export const useBoardStore = create<BoardStore>()(
  devtools((set) => ({
    ...initialState,

    addItem: (item, id) =>
      set((state) => {
        const newState = addItemToBoard(state, {
          item: { ...item, id },
          listId: item.listId,
        })
        // Only recalculate the column where the item was added
        return recalculateColumnItemTimes(newState, [item.listId])
      }),

    updateItem: (id, updates) =>
      set((state) => {
        const columnId = findColumnContainingItem(state, id)
        const newState = updateItemInBoard(state, id, updates)
        // Recalculate columns affected by update (source and destination if moved)
        const columnsToRecalculate: string[] = [columnId].filter(
          Boolean
        ) as string[]
        if (updates.listId && updates.listId !== columnId) {
          columnsToRecalculate.push(updates.listId)
        }
        return columnsToRecalculate.length > 0
          ? recalculateColumnItemTimes(newState, columnsToRecalculate)
          : newState
      }),

    deleteItem: (id) =>
      set((state) => {
        const columnId = findColumnContainingItem(state, id)
        const newState = deleteItemFromBoard(state, id)
        // Recalculate the column if item was in one
        return columnId
          ? recalculateColumnItemTimes(newState, [columnId])
          : newState
      }),

    addColumn: (column, id) =>
      set((state) => ({
        ...state,
        columns: {
          ...state.columns,
          [id]: { ...column, id, itemIds: [] },
        },
        itemTimes: state.itemTimes, // No times to recalculate for empty column
      })),

    updateColumn: (id, updates) =>
      set((state) => {
        const newState = updateColumnInBoard(state, id, updates)
        // Recalculate all items in this column due to potential time changes
        return recalculateColumnItemTimes(newState, [id])
      }),

    deleteColumn: (id) => set((state) => deleteColumnFromBoard(state, id)),

    handleDragOver: (event) =>
      set((state) => {
        const columnItemsMap = createColumnItemsMap(state.columns)
        const result = move(columnItemsMap, event)
        if (!result) {
          return state
        }

        // Check if anything actually changed
        let hasChanges = false
        Object.entries(result as Record<string, string[]>).forEach(
          ([columnId, newItemIds]) => {
            const oldItemIds = state.columns[columnId]?.itemIds ?? []
            if (JSON.stringify(oldItemIds) !== JSON.stringify(newItemIds)) {
              hasChanges = true
            }
          }
        )

        if (!hasChanges) {
          return state
        }

        // Apply the move by updating columns to match result
        const newColumns = { ...state.columns }
        const changedColumns: string[] = []

        Object.entries(result as Record<string, string[]>).forEach(
          ([columnId, newItemIds]) => {
            const oldItemIds = state.columns[columnId]?.itemIds ?? []
            if (JSON.stringify(oldItemIds) !== JSON.stringify(newItemIds)) {
              newColumns[columnId] = {
                ...newColumns[columnId],
                itemIds: newItemIds,
              }
              changedColumns.push(columnId)
            }
          }
        )

        const newState: AppState = {
          ...state,
          columns: newColumns,
        }

        // Recalculate times only for changed columns
        return recalculateColumnItemTimes(newState, changedColumns)
      }),

    recalculateColumnTimes: (columnId: string) =>
      set((state) => recalculateColumnItemTimes(state, [columnId])),
  }))
)

// Selectors for performance optimization
export const selectColumn = (id: string) => (state: BoardStore) =>
  state.columns[id]
export const selectItem = (id: string) => (state: BoardStore) => state.items[id]
export const selectItemTimesData = (id: string) => (state: BoardStore) =>
  state.itemTimes[id] || { startTime: new Time(0, 0), endTime: new Time(0, 0) }
export const selectAllColumns = (state: BoardStore) => state.columns
export const selectAllItems = (state: BoardStore) => state.items

// Custom hook for component needs
export function useBoardData() {
  const columns = useBoardStore((state) => state.columns)
  const items = useBoardStore((state) => state.items)
  const deleteItem = useBoardStore((state) => state.deleteItem)
  const handleDragOver = useBoardStore((state) => state.handleDragOver)

  return { columns, items, deleteItem, handleDragOver }
}
