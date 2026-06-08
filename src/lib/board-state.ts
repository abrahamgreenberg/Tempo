import { findItemPlacement } from "@/lib/board"
import type { AppState, Column, Item, ItemUpdate } from "@/types/domain"

export interface ItemMoveOperation {
  itemId: string
  fromColumn: string
  toColumn: string
  toIndex: number
}

export function createColumnItemsMap(columns: Record<string, Column>) {
  return Object.fromEntries(
    Object.entries(columns).map(([columnId, column]) => [
      columnId,
      column.itemIds,
    ])
  ) as Record<string, string[]>
}

export function resolveItemMoveOperation(
  columns: Record<string, Column>,
  nextColumnItems: Record<string, string[]>
): ItemMoveOperation | null {
  for (const [columnId, nextItemIds] of Object.entries(nextColumnItems)) {
    const previousItemIds = columns[columnId]?.itemIds ?? []
    if (JSON.stringify(previousItemIds) === JSON.stringify(nextItemIds)) {
      continue
    }

    const movedItemId = nextItemIds.find(
      (itemId) => !previousItemIds.includes(itemId)
    )
    if (!movedItemId) {
      continue
    }

    for (const [fromColumnId, column] of Object.entries(columns)) {
      if (fromColumnId === columnId || !column.itemIds.includes(movedItemId)) {
        continue
      }

      return {
        itemId: movedItemId,
        fromColumn: fromColumnId,
        toColumn: columnId,
        toIndex: nextItemIds.indexOf(movedItemId),
      }
    }
  }

  return null
}

export function addItemToBoard(
  state: AppState,
  payload: { item: Item; listId: string }
): AppState {
  const { item, listId } = payload
  const column = state.columns[listId]

  return {
    ...state,
    items: {
      ...state.items,
      [item.id]: item,
    },
    columns: column
      ? {
          ...state.columns,
          [listId]: {
            ...column,
            itemIds: [...column.itemIds, item.id],
          },
        }
      : state.columns,
  }
}

export function updateItemInBoard(
  state: AppState,
  itemId: string,
  updates: ItemUpdate
): AppState {
  const currentItem = state.items[itemId]
  const currentPlacement = findItemPlacement(state.columns, itemId)
  if (!currentItem || !currentPlacement) {
    return state
  }

  const { listId, ...itemChanges } = updates

  return {
    ...state,
    items: {
      ...state.items,
      [itemId]: { ...currentItem, ...itemChanges },
    },
    columns:
      listId && listId !== currentPlacement.listId
        ? {
            ...state.columns,
            [currentPlacement.listId]: {
              ...state.columns[currentPlacement.listId],
              itemIds: state.columns[currentPlacement.listId].itemIds.filter(
                (id) => id !== itemId
              ),
            },
            [listId]: {
              ...state.columns[listId],
              itemIds: [...state.columns[listId].itemIds, itemId],
            },
          }
        : state.columns,
  }
}

export function deleteItemFromBoard(state: AppState, itemId: string): AppState {
  const remainingItems = { ...state.items }
  delete remainingItems[itemId]

  const columns = Object.entries(state.columns).reduce(
    (accumulator, [columnId, column]) => ({
      ...accumulator,
      [columnId]: {
        ...column,
        itemIds: column.itemIds.filter((id) => id !== itemId),
      },
    }),
    {} as Record<string, Column>
  )

  return {
    ...state,
    items: remainingItems,
    columns,
  }
}

export function updateColumnInBoard(
  state: AppState,
  columnId: string,
  updates: Partial<Column>
): AppState {
  const currentColumn = state.columns[columnId]
  if (!currentColumn) return state
  return {
    ...state,
    columns: {
      ...state.columns,
      [columnId]: { ...currentColumn, ...updates },
    },
  }
}

export function deleteColumnFromBoard(
  state: AppState,
  columnId: string
): AppState {
  const columnToDelete = state.columns[columnId]
  if (!columnToDelete) {
    return state
  }

  const remainingColumns = { ...state.columns }
  delete remainingColumns[columnId]

  const remainingColumnIds = Object.keys(remainingColumns)
  if (remainingColumnIds.length > 0 && columnToDelete.itemIds.length > 0) {
    const targetColumnId = remainingColumnIds[0]
    remainingColumns[targetColumnId] = {
      ...remainingColumns[targetColumnId],
      itemIds: [
        ...remainingColumns[targetColumnId].itemIds,
        ...columnToDelete.itemIds,
      ],
    }
  }

  return {
    ...state,
    columns: remainingColumns,
  }
}

export function moveItemInBoard(
  state: AppState,
  operation: ItemMoveOperation
): AppState {
  const fromColumn = state.columns[operation.fromColumn]
  const toColumn = state.columns[operation.toColumn]

  if (!fromColumn || !toColumn) {
    return state
  }

  const fromItemIds = fromColumn.itemIds.filter((id) => id !== operation.itemId)
  const toItemIds = [...toColumn.itemIds]
  toItemIds.splice(operation.toIndex, 0, operation.itemId)

  return {
    ...state,
    columns: {
      ...state.columns,
      [operation.fromColumn]: { ...fromColumn, itemIds: fromItemIds },
      [operation.toColumn]: { ...toColumn, itemIds: toItemIds },
    },
  }
}
