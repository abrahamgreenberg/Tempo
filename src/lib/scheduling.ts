import { Time } from "@/lib/utils"
import type { AppState, ItemLink, ItemTimes } from "@/types/domain"

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
 * Get ordered links for a column
 */
function getColumnLinks(itemLinks: Record<string, ItemLink>, columnId: string) {
  return Object.values(itemLinks)
    .filter((link) => link.columnId === columnId)
    .sort((a, b) => a.position - b.position)
}

export function calculateColumnItemTimes(
  state: AppState,
  columnIds: string[]
): Record<string, ItemTimes> {
  const result: Record<string, ItemTimes> = {}

  for (const columnId of columnIds) {
    const column = state.columns[columnId]
    if (!column) continue

    const links = getColumnLinks(state.itemLinks, columnId)

    let elapsedMinutes = 0

    for (const link of links) {
      const item = state.items[link.itemId]
      if (!item) continue

      result[link.itemId] = calculateItemTimes(
        column.startTime,
        item.durationMinutes,
        elapsedMinutes
      )

      elapsedMinutes += item.durationMinutes
    }
  }

  return result
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
    Object.assign(itemTimes, calculateColumnItemTimes(state, [columnId]))
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
    Object.assign(newItemTimes, calculateColumnItemTimes(state, [columnId]))
  })

  return {
    ...state,
    itemTimes: newItemTimes,
  }
}
