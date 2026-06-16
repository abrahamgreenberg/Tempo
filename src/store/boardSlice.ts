import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { BoardState, Item, ItemUpdate, Column } from "./boardTypes"
import { Time } from "@/lib/utils"

//store/boardSlice.ts
const initialState: BoardState = {
  columns: {
    col1: {
      id: "col1",
      name: "Morning",
      startTime: new Time(9, 0),
      endTime: new Time(12, 0),
      position: 0,
      date: "2025-01-01",
    },
    col2: {
      id: "col2",
      name: "Afternoon",
      startTime: new Time(13, 0),
      endTime: new Time(17, 0),
      position: 1,
      date: "2025-01-01",
    },
    col3: {
      id: "col3",
      name: "Evening",
      startTime: new Time(18, 0),
      endTime: new Time(22, 0),
      position: 2,
      date: "2025-01-01",
    },
  },

  items: {
    item1: {
      id: "item1",
      name: "Breakfast",
      durationMinutes: 30,
    },
    item2: {
      id: "item2",
      name: "Work",
      durationMinutes: 240,
    },
    item3: {
      id: "item3",
      name: "Gym",
      durationMinutes: 60,
    },
    item4: {
      id: "item4",
      name: "Dinner",
      durationMinutes: 45,
    },
  },

  itemLinks: {
    item1: {
      itemId: "item1",
      columnId: "col1",
      position: 0,
    },
    item2: {
      itemId: "item2",
      columnId: "col2",
      position: 0,
    },
    item3: {
      itemId: "item3",
      columnId: "col2",
      position: 1,
    },
    item4: {
      itemId: "item4",
      columnId: "col3",
      position: 0,
    },
  },
}

/**
 * Compute next position in a column
 */
function getNextPosition(
  links: BoardState["itemLinks"],
  columnId: string
): number {
  return Object.values(links).filter((l) => l.columnId === columnId).length
}

export const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    /**
     * Add a new item into a column
     */
    addItem: (
      state,
      action: PayloadAction<{ item: Item; columnId: string }>
    ) => {
      const { item, columnId } = action.payload

      state.items[item.id] = item

      state.itemLinks[item.id] = {
        itemId: item.id,
        columnId,
        position: getNextPosition(state.itemLinks, columnId),
      }
    },

    /**
     * Update item fields and optionally move column
     */
    updateItem: (
      state,
      action: PayloadAction<{ id: string; updates: ItemUpdate }>
    ) => {
      const { id, updates } = action.payload

      const item = state.items[id]
      const link = state.itemLinks[id]

      if (!item || !link) return

      // update item fields
      state.items[id] = {
        ...item,
        name: updates.name ?? item.name,
        durationMinutes: updates.durationMinutes ?? item.durationMinutes,
      }

      // handle move between columns
      if (updates.columnId && updates.columnId !== link.columnId) {
        state.itemLinks[id] = {
          itemId: id,
          columnId: updates.columnId,
          position: getNextPosition(state.itemLinks, updates.columnId),
        }
      }
    },

    /**
     * Delete item completely
     */
    deleteItem: (state, action: PayloadAction<string>) => {
      const id = action.payload

      delete state.items[id]
      delete state.itemLinks[id]
    },

    /**
     * Add a column
     */
    addColumn: (state, action: PayloadAction<Column>) => {
      const column = action.payload
      state.columns[column.id] = column
    },

    /**
     * Update column properties (name, times, etc.)
     */
    updateColumn: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Column> }>
    ) => {
      const { id, updates } = action.payload

      const column = state.columns[id]
      if (!column) return

      state.columns[id] = {
        ...column,
        ...updates,
      }
    },

    /**
     * Delete column + optionally move or remove items
     */
    deleteColumn: (state, action: PayloadAction<string>) => {
      const columnId = action.payload

      const column = state.columns[columnId]
      if (!column) return

      delete state.columns[columnId]

      const remainingColumns = Object.keys(state.columns)

      // if no columns left → remove everything in that column
      if (remainingColumns.length === 0) {
        for (const [itemId, link] of Object.entries(state.itemLinks)) {
          if (link.columnId === columnId) {
            delete state.items[itemId]
            delete state.itemLinks[itemId]
          }
        }
        return
      }

      // move items to first remaining column
      const targetColumnId = remainingColumns[0]

      for (const [itemId, link] of Object.entries(state.itemLinks)) {
        if (link.columnId === columnId) {
          state.itemLinks[itemId] = {
            itemId,
            columnId: targetColumnId,
            position: getNextPosition(state.itemLinks, targetColumnId),
          }
        }
      }
    },

    /**
     * Drag reorder inside a column
     */
    reorderColumn: (
      state,
      action: PayloadAction<{ columnId: string; itemIds: string[] }>
    ) => {
      const { columnId, itemIds } = action.payload

      itemIds.forEach((itemId, index) => {
        const link = state.itemLinks[itemId]
        if (!link) return

        link.columnId = columnId
        link.position = index
      })
    },

    /**
     * Replace full state (useful for hydration / sync)
     */
    setState: (_state, action: PayloadAction<BoardState>) => {
      return action.payload
    },
  },
})

export const {
  addItem,
  updateItem,
  deleteItem,
  addColumn,
  updateColumn,
  deleteColumn,
  reorderColumn,
  setState,
} = boardSlice.actions

export default boardSlice.reducer
