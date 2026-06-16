import type { Time } from "@/lib/utils"

// store/boardTypes.ts
export interface Item {
  id: string
  name: string
  durationMinutes: number
}

export interface Column {
  id: string
  name: string
  startTime: Time
  endTime: Time
  position: number
  date: string
}

export interface ItemLink {
  itemId: string
  columnId: string
  position: number
}

export interface ItemUpdate {
  name?: string
  durationMinutes?: number
  columnId?: string
}

export interface ItemTimes {
  startTime: Time
  endTime: Time
}
export interface BoardState {
  columns: Record<string, Column>
  items: Record<string, Item>
  itemLinks: Record<string, ItemLink>
}
