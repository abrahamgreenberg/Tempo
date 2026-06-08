export interface Item {
  id: string
  name: string
  durationMinutes: number
}

export interface ItemPlacement {
  listId: string
  position: number
}

export type NewItem = Omit<Item, "id"> & Pick<ItemPlacement, "listId">

export type ItemUpdate = Partial<Omit<Item, "id">> & {
  listId?: string
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
}

export type AppAction =
  | { type: "ADD_ITEM"; payload: { item: Item; listId: string } }
  | { type: "UPDATE_ITEM"; id: string; payload: ItemUpdate }
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
