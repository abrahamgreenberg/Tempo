import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { BoardState, Item, Column } from "./boardTypes"
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
      rank: 1000,
    },
    item2: {
      itemId: "item2",
      columnId: "col2",
      rank: 1000,
    },
    item3: {
      itemId: "item3",
      columnId: "col2",
      rank: 2000,
    },
    item4: {
      itemId: "item4",
      columnId: "col3",
      rank: 1000,
    },
  },
}

function getDefaultRank(links: BoardState["itemLinks"], columnId: string) {
  const values = Object.values(links)
    .filter((l) => l.columnId === columnId)
    .map((l) => l.rank)

  if (values.length === 0) return 1000

  return Math.max(...values) + 1000
}

function getMiddleRank(a: number, b: number) {
  return (a + b) / 2
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
        rank: getDefaultRank(state.itemLinks, columnId),
      }
    },

    /**
     * Update item fields and optionally move column
     */
    updateItem: (state, action) => {
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

      const toColumn = updates.columnId ?? link.columnId
      const toIndex = updates.toIndex

      const columnChanged = toColumn !== link.columnId
      const hasExplicitReorder = typeof toIndex === "number"

      // If this update only edits item fields, keep placement untouched.
      if (!columnChanged && !hasExplicitReorder) {
        return
      }

      // If column changes from form edit without explicit drop index, append to end.
      if (columnChanged && !hasExplicitReorder) {
        link.columnId = toColumn
        link.rank = getDefaultRank(state.itemLinks, toColumn)
        return
      }

      const columnLinks = Object.values(state.itemLinks)
        .filter((l) => l.columnId === toColumn && l.itemId !== id)
        .sort((a, b) => a.rank - b.rank)

      const index = toIndex
      const prev = columnLinks[index - 1]
      const next = columnLinks[index]

      let newRank: number

      if (!prev && !next) {
        newRank = 1000
      } else if (!prev) {
        newRank = next.rank - 1000
      } else if (!next) {
        newRank = prev.rank + 1000
      } else {
        newRank = getMiddleRank(prev.rank, next.rank)
      }

      link.columnId = toColumn
      link.rank = newRank
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

    deleteColumn: (state, action: PayloadAction<string>) => {
      const columnId = action.payload

      const column = state.columns[columnId]
      if (!column) return

      delete state.columns[columnId]

      const remainingColumns = Object.keys(state.columns)

      // remove everything if last column
      if (remainingColumns.length === 0) {
        for (const [itemId, link] of Object.entries(state.itemLinks)) {
          if (link.columnId === columnId) {
            delete state.items[itemId]
            delete state.itemLinks[itemId]
          }
        }
        return
      }

      const targetColumnId = remainingColumns[0]

      for (const [, link] of Object.entries(state.itemLinks)) {
        if (link.columnId === columnId) {
          link.columnId = targetColumnId
          link.rank = getDefaultRank(state.itemLinks, targetColumnId)
        }
      }
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
  setState,
} = boardSlice.actions

export default boardSlice.reducer
