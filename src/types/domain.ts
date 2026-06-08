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
