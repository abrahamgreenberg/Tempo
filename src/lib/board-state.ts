import type {
  AppState,
  Column,
  Item,
  ItemLink,
  ItemUpdate,
} from "@/types/domain"

export function getItemsInColumn(
  itemLinks: Record<string, ItemLink>,
  columnId: string
) {
  return Object.values(itemLinks)
    .filter((link) => link.columnId === columnId)
    .sort((a, b) => a.position - b.position)
}

export function getNextPosition(
  itemLinks: Record<string, ItemLink>,
  columnId: string
) {
  return getItemsInColumn(itemLinks, columnId).length
}

export function addItemToBoard(
  state: AppState,
  payload: {
    item: Item
    listId: string
  }
): AppState {
  const { item, listId } = payload

  if (!state.columns[listId]) {
    return state
  }

  return {
    ...state,

    items: {
      ...state.items,
      [item.id]: item,
    },

    itemLinks: {
      ...state.itemLinks,

      [item.id]: {
        itemId: item.id,
        columnId: listId,
        position: getNextPosition(state.itemLinks, listId),
      },
    },
  }
}

export function updateItemInBoard(
  state: AppState,
  itemId: string,
  updates: ItemUpdate
): AppState {
  const item = state.items[itemId]
  const link = state.itemLinks[itemId]

  if (!item || !link) {
    return state
  }

  const { listId, ...itemChanges } = updates

  const nextState: AppState = {
    ...state,

    items: {
      ...state.items,

      [itemId]: {
        ...item,
        ...itemChanges,
      },
    },
  }

  if (!listId || listId === link.columnId) {
    return nextState
  }

  return {
    ...nextState,

    itemLinks: {
      ...nextState.itemLinks,

      [itemId]: {
        ...link,

        columnId: listId,

        position: getNextPosition(nextState.itemLinks, listId),
      },
    },
  }
}

export function deleteItemFromBoard(state: AppState, itemId: string): AppState {
  if (!state.items[itemId]) {
    return state
  }

  const items = { ...state.items }
  delete items[itemId]

  const itemLinks = { ...state.itemLinks }
  delete itemLinks[itemId]

  const itemTimes = { ...state.itemTimes }
  delete itemTimes[itemId]

  return {
    ...state,

    items,
    itemLinks,
    itemTimes,
  }
}

export function updateColumnInBoard(
  state: AppState,
  columnId: string,
  updates: Partial<Column>
): AppState {
  const currentColumn = state.columns[columnId]

  if (!currentColumn) {
    return state
  }

  return {
    ...state,

    columns: {
      ...state.columns,

      [columnId]: {
        ...currentColumn,
        ...updates,
      },
    },
  }
}

export function deleteColumnFromBoard(
  state: AppState,
  columnId: string
): AppState {
  if (!state.columns[columnId]) {
    return state
  }

  const columns = { ...state.columns }
  delete columns[columnId]

  const remainingColumnIds = Object.keys(columns)

  const itemLinks = {
    ...state.itemLinks,
  }

  const itemTimes = {
    ...state.itemTimes,
  }

  if (remainingColumnIds.length === 0) {
    Object.values(itemLinks).forEach((link) => {
      if (link.columnId === columnId) {
        delete itemLinks[link.itemId]
        delete itemTimes[link.itemId]
      }
    })

    return {
      ...state,
      columns,
      itemLinks,
      itemTimes,
    }
  }

  const targetColumnId = remainingColumnIds[0]

  const movedItems = Object.values(itemLinks)
    .filter((link) => link.columnId === columnId)
    .sort((a, b) => a.position - b.position)

  const startPosition = getNextPosition(itemLinks, targetColumnId)

  movedItems.forEach((link, index) => {
    itemLinks[link.itemId] = {
      ...link,

      columnId: targetColumnId,

      position: startPosition + index,
    }
  })

  return {
    ...state,

    columns,
    itemLinks,
    itemTimes,
  }
}
