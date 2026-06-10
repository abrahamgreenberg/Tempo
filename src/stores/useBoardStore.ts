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
import {
  calculateAllItemTimes,
  recalculateColumnItemTimes,
} from "@/lib/scheduling"
import { Time } from "@/lib/utils"
import type { AppState, Column, ItemUpdate, NewItem } from "@/types/domain"

/**
 * Build itemPlacements index from columns
 */
function buildItemPlacements(
  columns: Record<string, Column>
): Record<string, { listId: string; position: number }> {
  const placements: Record<string, { listId: string; position: number }> = {}
  Object.entries(columns).forEach(([columnId, column]) => {
    column.itemIds.forEach((itemId, index) => {
      placements[itemId] = { listId: columnId, position: index }
    })
  })
  return placements
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
  itemPlacements: buildItemPlacements(baseInitialState.columns),
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
  handleDragEnd: () => void
  recalculateColumnTimes: (columnId: string) => void
}

/**
 * Find which column contains an item - now O(1) with itemPlacements index
 */
function findColumnContainingItem(
  state: AppState,
  itemId: string
): string | null {
  const placement = state.itemPlacements[itemId]
  return placement ? placement.listId : null
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
        itemPlacements: state.itemPlacements, // No placements to update
      })),

    updateColumn: (id, updates) =>
      set((state) => {
        const newState = updateColumnInBoard(state, id, updates)
        // Recalculate all items in this column due to potential time changes
        return recalculateColumnItemTimes(newState, [id])
      }),

    deleteColumn: (id) =>
      set((state) => {
        const columnToDelete = state.columns[id]
        if (!columnToDelete) return state

        const hadItems = columnToDelete.itemIds.length > 0
        const remainingColumnIds = Object.keys(state.columns).filter(
          (cId) => cId !== id
        )

        const newState = deleteColumnFromBoard(state, id)

        // If items were moved to another column, recalculate times
        if (hadItems && remainingColumnIds.length > 0) {
          const targetColumnId = remainingColumnIds[0]
          return recalculateColumnItemTimes(newState, [targetColumnId])
        }

        return newState
      }),

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

        Object.entries(result as Record<string, string[]>).forEach(
          ([columnId, newItemIds]) => {
            const oldItemIds = state.columns[columnId]?.itemIds ?? []
            if (JSON.stringify(oldItemIds) !== JSON.stringify(newItemIds)) {
              newColumns[columnId] = {
                ...newColumns[columnId],
                itemIds: newItemIds,
              }
            }
          }
        )

        // Update columns only - do NOT recalculate times or placements during drag
        // This prevents expensive recalculations on every drag-over event
        return {
          ...state,
          columns: newColumns,
        }
      }),

    handleDragEnd: () =>
      set((state) => {
        // Rebuild placements for all columns
        const newPlacements: Record<
          string,
          { listId: string; position: number }
        > = {}
        Object.entries(state.columns).forEach(([columnId, column]) => {
          column.itemIds.forEach((itemId, index) => {
            newPlacements[itemId] = { listId: columnId, position: index }
          })
        })

        // Recalculate times for all items after drag completes
        const newState: AppState = {
          ...state,
          itemPlacements: newPlacements,
        }

        return recalculateColumnItemTimes(newState, Object.keys(state.columns))
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
  const handleDragEnd = useBoardStore((state) => state.handleDragEnd)

  return { columns, items, deleteItem, handleDragOver, handleDragEnd }
}
