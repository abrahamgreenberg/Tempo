export interface Item {
  id: string
  name: string
  durationMinutes: number
  listId: string // which column/list this item belongs to
  position: number // order within the list
}

export interface Column {
  id: string
  name: string
  startTime: string
  endTime: string
  position: number // order of columns
  date: string // ISO date string (YYYY-MM-DD) for multi-day support
  itemIds: string[] // array of item IDs in this column
}

export interface AppState {
  columns: Record<string, Column>
  items: Record<string, Item>
  ui: {
    editingItem: string | null
    editingColumn: string | null
  }
}

export type AppAction =
  | { type: "ADD_ITEM"; payload: Item }
  | { type: "UPDATE_ITEM"; id: string; payload: Partial<Item> }
  | { type: "DELETE_ITEM"; id: string }
  | { type: "ADD_COLUMN"; payload: Column }
  | { type: "UPDATE_COLUMN"; id: string; payload: Partial<Column> }
  | { type: "DELETE_COLUMN"; id: string }
  | {
      type: "MOVE_ITEM"
      itemId: string
      fromColumn: string
      toColumn: string
      toIndex: number
    }
  | { type: "OPEN_ITEM_EDITOR"; id: string }
  | { type: "CLOSE_ITEM_EDITOR" }
  | { type: "OPEN_COLUMN_EDITOR"; id: string }
  | { type: "CLOSE_COLUMN_EDITOR" }
