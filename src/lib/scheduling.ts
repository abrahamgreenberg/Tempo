import { Time } from "@/lib/utils"
import type { AppState, ItemTimes } from "@/types/domain"

/**
 * Calculate item's start and end times based on column start time and preceding item durations
 */
export function calculateItemTimes(
  columnStartTime: Time,
  durationMinutes: number,
  precedingItemsDuration: number
): ItemTimes {
  const startTime = columnStartTime.addMinutes(precedingItemsDuration)
  const endTime = startTime.addMinutes(durationMinutes)

  return { startTime, endTime }
}

/**
 * Calculate times for items in a specific column
 * This is the core logic used by both calculateAllItemTimes and recalculateColumnItemTimes
 */
export function calculateColumnItemTimes(
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
export function calculateAllItemTimes(
  state: AppState
): Record<string, ItemTimes> {
  const itemTimes: Record<string, ItemTimes> = {}

  Object.keys(state.columns).forEach((columnId) => {
    Object.assign(itemTimes, calculateColumnItemTimes(state, columnId))
  })

  return itemTimes
}

/**
 * Recalculate times for specific columns only (not all columns)
 * More efficient than recalculating everything
 */
export function recalculateColumnItemTimes(
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
