import type { AppState, Column, Item, ItemPlacement } from "@/types/domain"

export interface ApiItemPayload {
  id: string
  name: string
  durationMinutes: number
  listId: string
  position: number
}

type BoardSnapshot = Pick<AppState, "columns" | "items">

export function findItemPlacement(
  columns: Record<string, Column>,
  itemId: string
): ItemPlacement | null {
  for (const column of Object.values(columns)) {
    const position = column.itemIds.indexOf(itemId)
    if (position !== -1) {
      return {
        listId: column.id,
        position,
      }
    }
  }

  return null
}

export function toApiItemPayload(
  items: Record<string, Item>,
  columns: Record<string, Column>,
  itemId: string
): ApiItemPayload | null {
  const item = items[itemId]
  if (!item) {
    return null
  }

  const placement = findItemPlacement(columns, itemId)
  if (!placement) {
    return null
  }

  return {
    id: item.id,
    name: item.name,
    durationMinutes: item.durationMinutes,
    listId: placement.listId,
    position: placement.position,
  }
}

export function toApiItemPayloads({
  items,
  columns,
}: BoardSnapshot): ApiItemPayload[] {
  return Object.values(columns)
    .sort((left, right) => left.position - right.position)
    .flatMap((column) =>
      column.itemIds.flatMap((itemId, position) => {
        const item = items[itemId]
        if (!item) {
          return []
        }

        return {
          id: item.id,
          name: item.name,
          durationMinutes: item.durationMinutes,
          listId: column.id,
          position,
        }
      })
    )
}

export function withDerivedPlacement(
  item: Item,
  columns: Record<string, Column>
): (Item & ItemPlacement) | null {
  const placement = findItemPlacement(columns, item.id)
  if (!placement) {
    return null
  }

  return {
    ...item,
    ...placement,
  }
}