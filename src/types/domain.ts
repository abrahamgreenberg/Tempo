import { Time } from "@/lib/utils"

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

/**
 * Join table between Items and Columns.
 *
 * This is the source of truth for:
 * - which column an item belongs to
 * - ordering inside that column
 */
export interface ItemLink {
  itemId: string
  columnId: string
  position: number
}

export interface ItemTimes {
  startTime: Time
  endTime: Time
}

export interface NewItem {
  name: string
  durationMinutes: number
  listId: string
}

export interface ItemUpdate {
  name?: string
  durationMinutes?: number

  /**
   * Move item to another column.
   */
  listId?: string
}

export interface AppState {
  /**
   * Persisted entities
   */
  columns: Record<string, Column>

  items: Record<string, Item>

  /**
   * Relational join table
   *
   * itemId -> link
   */
  itemLinks: Record<string, ItemLink>

  /**
   * Derived scheduling cache
   */
  itemTimes: Record<string, ItemTimes>
}
