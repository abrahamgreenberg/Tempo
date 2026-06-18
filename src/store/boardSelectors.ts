import type { RootState } from "@/store"
import type { ItemTimes } from "./boardTypes"
import { createSelector } from "@reduxjs/toolkit"

export const selectAllItemTimes = createSelector(
  (state: RootState) => state.board.itemLinks,
  (state: RootState) => state.board.items,
  (state: RootState) => state.board.columns,
  (itemLinks, items, columns) => {
    console.log("recomputing times")

    const result: Record<string, ItemTimes> = {}

    const grouped: Record<string, (typeof itemLinks)[string][]> = {}

    // group by column
    Object.values(itemLinks).forEach((link) => {
      grouped[link.columnId] ??= []
      grouped[link.columnId].push(link)
    })

    // IMPORTANT CHANGE: sort by rank (NOT position)
    for (const [columnId, links] of Object.entries(grouped)) {
      const column = columns[columnId]
      if (!column) continue

      links.sort((a, b) => a.rank - b.rank)

      let elapsed = 0

      for (const link of links) {
        const item = items[link.itemId]
        if (!item) continue

        result[link.itemId] = {
          startTime: column.startTime.addMinutes(elapsed),
          endTime: column.startTime.addMinutes(elapsed + item.durationMinutes),
        }

        elapsed += item.durationMinutes
      }
    }

    return result
  }
)

export const selectColumns = (state: RootState) => state.board.columns
export const selectItems = (state: RootState) => state.board.items
export const selectLinks = (state: RootState) => state.board.itemLinks
export const selectItemTimesById = (itemId: string) =>
  createSelector(selectAllItemTimes, (times) => times[itemId])
export const selectColumnById = (id: string) => (state: RootState) =>
  state.board.columns[id]

export const selectItemById = (id: string) => (state: RootState) =>
  state.board.items[id]
