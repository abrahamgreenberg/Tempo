import type { AppState, Column, Item, ItemUpdate } from "@/types/domain"

export function createColumnItemsMap(columns: Record<string, Column>) {
  return Object.fromEntries(
    Object.entries(columns).map(([columnId, column]) => [
      columnId,
      column.itemIds,
    ])
  ) as Record<string, string[]>
}

export function addItemToBoard(
  state: AppState,
  payload: { item: Item; listId: string }
): AppState {
  const { item, listId } = payload
  const column = state.columns[listId]

  if (!column) return state

  const newPosition = column.itemIds.length

  return {
    ...state,
    items: {
      ...state.items,
      [item.id]: item,
    },
    columns: {
      ...state.columns,
      [listId]: {
        ...column,
        itemIds: [...column.itemIds, item.id],
      },
    },
    itemPlacements: {
      ...state.itemPlacements,
      [item.id]: { listId, position: newPosition },
    },
  }
}

export function updateItemInBoard(
  state: AppState,
  itemId: string,
  updates: ItemUpdate
): AppState {
  const currentItem = state.items[itemId]
  const currentPlacement = state.itemPlacements[itemId]
  if (!currentItem || !currentPlacement) {
    return state
  }

  const { listId, ...itemChanges } = updates

  // If moving to a different column
  if (listId && listId !== currentPlacement.listId) {
    const newColumns = {
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

    // Rebuild placements for both affected columns
    const newPlacements = { ...state.itemPlacements }
    newColumns[currentPlacement.listId].itemIds.forEach((id, index) => {
      newPlacements[id] = { listId: currentPlacement.listId, position: index }
    })
    newColumns[listId].itemIds.forEach((id, index) => {
      newPlacements[id] = { listId, position: index }
    })

    return {
      ...state,
      items: {
        ...state.items,
        [itemId]: { ...currentItem, ...itemChanges },
      },
      columns: newColumns,
      itemPlacements: newPlacements,
    }
  }

  // Just updating item properties, no move
  return {
    ...state,
    items: {
      ...state.items,
      [itemId]: { ...currentItem, ...itemChanges },
    },
  }
}

export function deleteItemFromBoard(state: AppState, itemId: string): AppState {
  const placement = state.itemPlacements[itemId]
  if (!placement) return state

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

  // Rebuild placements for the affected column and remove deleted item
  const newPlacements = { ...state.itemPlacements }
  delete newPlacements[itemId]
  columns[placement.listId].itemIds.forEach((id, index) => {
    newPlacements[id] = { listId: placement.listId, position: index }
  })

  // Clean up itemTimes for deleted item
  const newItemTimes = { ...state.itemTimes }
  delete newItemTimes[itemId]

  return {
    ...state,
    items: remainingItems,
    columns,
    itemPlacements: newPlacements,
    itemTimes: newItemTimes,
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

  const newPlacements = { ...state.itemPlacements }
  const newItemTimes = { ...state.itemTimes }

  // If no columns remain, clean up all items, placements, and times
  const remainingColumnIds = Object.keys(remainingColumns)
  if (remainingColumnIds.length === 0) {
    columnToDelete.itemIds.forEach((itemId) => {
      delete newPlacements[itemId]
      delete newItemTimes[itemId]
    })

    return {
      ...state,
      columns: remainingColumns,
      itemPlacements: newPlacements,
      itemTimes: newItemTimes,
    }
  }

  // Move items to first remaining column
  if (columnToDelete.itemIds.length > 0) {
    const targetColumnId = remainingColumnIds[0]
    const targetColumn = remainingColumns[targetColumnId]
    const newItemIds = [...targetColumn.itemIds, ...columnToDelete.itemIds]

    remainingColumns[targetColumnId] = {
      ...targetColumn,
      itemIds: newItemIds,
    }

    // Rebuild placements for target column (times will be recalculated by caller)
    newItemIds.forEach((itemId, index) => {
      newPlacements[itemId] = { listId: targetColumnId, position: index }
    })
  }

  return {
    ...state,
    columns: remainingColumns,
    itemPlacements: newPlacements,
    itemTimes: newItemTimes,
  }
}
