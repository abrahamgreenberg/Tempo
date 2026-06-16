import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { move } from "@dnd-kit/helpers"

import {
  addItemToBoard,
  deleteColumnFromBoard,
  deleteItemFromBoard,
  updateColumnInBoard,
  updateItemInBoard,
} from "@/lib/board-state"

import {
  calculateAllItemTimes,
  calculateColumnItemTimes,
} from "@/lib/scheduling"

import type { AppState, Column, ItemUpdate, NewItem } from "@/types/domain"

import { baseInitialState } from "@/lib/base-state"
import { Time } from "@/lib/utils"

const initialState: AppState = {
  ...baseInitialState,
  itemTimes: calculateAllItemTimes(baseInitialState as unknown as AppState),
}

interface BoardStore extends AppState {
  addItem: (item: NewItem, id: string) => void
  updateItem: (id: string, updates: ItemUpdate) => void
  deleteItem: (id: string) => void

  addColumn: (column: Omit<Column, "id">, id: string) => void
  updateColumn: (id: string, updates: Partial<Column>) => void
  deleteColumn: (id: string) => void

  handleDragOver: (event: Parameters<typeof move>[1]) => void
  handleDragEnd: () => void

  recalculateColumnTimes: (columnId: string) => void
}

function getItemColumn(state: AppState, itemId: string) {
  return state.itemLinks[itemId]?.columnId ?? null
}

export function selectOrderedColumnItems(state: AppState) {
  const grouped: Record<string, string[]> = {}

  for (const link of Object.values(state.itemLinks)) {
    if (!grouped[link.columnId]) {
      grouped[link.columnId] = []
    }

    grouped[link.columnId].push(link.itemId)
  }

  // enforce ordering
  for (const columnId in grouped) {
    grouped[columnId].sort((a, b) => {
      return (
        (state.itemLinks[a]?.position ?? 0) -
        (state.itemLinks[b]?.position ?? 0)
      )
    })
  }

  return grouped
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

        return calculateColumnItemTimes(newState, [item.listId])
      }),

    updateItem: (id, updates) =>
      set((state) => {
        const oldColumn = getItemColumn(state, id)

        const newState = updateItemInBoard(state, id, updates)

        const colsToRecalc = new Set<string>()

        if (oldColumn) colsToRecalc.add(oldColumn)

        if (updates.listId && updates.listId !== oldColumn) {
          colsToRecalc.add(updates.listId)
        }

        return calculateColumnItemTimes(newState, Array.from(colsToRecalc))
      }),

    deleteItem: (id) =>
      set((state) => {
        const columnId = getItemColumn(state, id)

        const newState = deleteItemFromBoard(state, id)

        if (!columnId) return newState

        return calculateColumnItemTimes(newState, [columnId])
      }),

    addColumn: (column, id) =>
      set((state) => ({
        ...state,
        columns: {
          ...state.columns,
          [id]: {
            ...column,
            id,
          },
        },
      })),

    updateColumn: (id, updates) =>
      set((state) => {
        const newState = updateColumnInBoard(state, id, updates)

        return calculateColumnItemTimes(newState, [id])
      }),

    deleteColumn: (id) =>
      set((state) => {
        const hadItems = Object.values(state.itemLinks).some(
          (l) => l.columnId === id
        )

        const remainingColumns = Object.keys(state.columns).filter(
          (c) => c !== id
        )

        const newState = deleteColumnFromBoard(state, id)

        if (hadItems && remainingColumns.length > 0) {
          return calculateColumnItemTimes(newState, [remainingColumns[0]])
        }

        return newState
      }),

    handleDragOver: (event) =>
      set((state) => {
        const columnItemsMap = Object.values(state.itemLinks).reduce(
          (acc, link) => {
            if (!acc[link.columnId]) {
              acc[link.columnId] = []
            }

            acc[link.columnId].push(link.itemId)

            return acc
          },
          {} as Record<string, string[]>
        )

        const result = move(columnItemsMap, event)

        if (!result) return state

        const itemLinks = { ...state.itemLinks }

        Object.entries(result).forEach(([columnId, itemIds]) => {
          itemIds.forEach((itemId, position) => {
            itemLinks[itemId] = {
              ...itemLinks[itemId],
              columnId,
              position,
            }
          })
        })

        return {
          ...state,
          itemLinks,
        }
      }),

    handleDragEnd: () =>
      set((state) =>
        calculateColumnItemTimes(state, Object.keys(state.columns))
      ),

    recalculateColumnTimes: (columnId: string) =>
      set((state) => calculateColumnItemTimes(state, [columnId])),
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
export const selectItemWithLink = (id: string) => (state: BoardStore) => {
  const item = state.items[id]
  const link = state.itemLinks[id]

  if (!item || !link) return null

  return {
    ...item,
    listId: link.columnId,
    position: link.position,
  }
}
// Custom hook for component needs
export function useBoardData() {
  const columns = useBoardStore((s) => s.columns)
  const items = useBoardStore((s) => s.items)
  const itemLinks = useBoardStore((s) => s.itemLinks)

  const orderedItems = useBoardStore(selectOrderedColumnItems)

  const deleteItem = useBoardStore((s) => s.deleteItem)
  const handleDragOver = useBoardStore((s) => s.handleDragOver)
  const handleDragEnd = useBoardStore((s) => s.handleDragEnd)

  return {
    columns,
    items,
    itemLinks,
    orderedItems,
    deleteItem,
    handleDragOver,
    handleDragEnd,
  }
}
