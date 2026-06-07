import { useReducer, useCallback } from "react"
import type { AppState, AppAction, Item, Column } from "@/types/domain"

const initialState: AppState = {
  columns: {
    "1a2b3c4d5e6f7g8h9i0j": {
      id: "1a2b3c4d5e6f7g8h9i0j",
      name: "Morning",
      startTime: "09:00",
      endTime: "12:00",
      position: 0,
      date: "2025-01-01",
      itemIds: ["abc1def2ghi3jkl4mno5"],
    },
    "2k3l4m5n6o7p8q9r0s1t": {
      id: "2k3l4m5n6o7p8q9r0s1t",
      name: "Afternoon",
      startTime: "14:00",
      endTime: "17:00",
      position: 1,
      date: "2025-01-01",
      itemIds: ["ghi2jkl3mno4pqr5stu6"],
    },
    "3u4v5w6x7y8z9a0b1c2d": {
      id: "3u4v5w6x7y8z9a0b1c2d",
      name: "Evening",
      startTime: "18:00",
      endTime: "20:00",
      position: 2,
      date: "2025-01-01",
      itemIds: ["pqr6stu7vwx8yz9abc0def"],
    },
  },
  items: {
    abc1def2ghi3jkl4mno5: {
      id: "abc1def2ghi3jkl4mno5",
      name: "Morning Routine",
      durationMinutes: 60,
      listId: "1a2b3c4d5e6f7g8h9i0j",
      position: 0,
    },
    pqr6stu7vwx8yz9abc0def: {
      id: "pqr6stu7vwx8yz9abc0def",
      name: "Study Block",
      durationMinutes: 120,
      listId: "1a2b3c4d5e6f7g8h9i0j",
      position: 1,
    },
    ghi2jkl3mno4pqr5stu6: {
      id: "ghi2jkl3mno4pqr5stu6",
      name: "Wrap-up",
      durationMinutes: 30,
      listId: "2k3l4m5n6o7p8q9r0s1t",
      position: 0,
    },
  },
  ui: {
    editingItem: null,
    editingColumn: null,
  },
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_ITEM": {
      const item = action.payload
      const column = state.columns[item.listId]

      return {
        ...state,
        items: {
          ...state.items,
          [item.id]: item,
        },
        columns: column
          ? {
              ...state.columns,
              [item.listId]: {
                ...column,
                itemIds: [...column.itemIds, item.id],
              },
            }
          : state.columns,
      }
    }

    case "UPDATE_ITEM": {
      const currentItem = state.items[action.id]
      if (!currentItem) return state
      return {
        ...state,
        items: {
          ...state.items,
          [action.id]: { ...currentItem, ...action.payload },
        },
        columns:
          action.payload.listId && action.payload.listId !== currentItem.listId
            ? {
                ...state.columns,
                [currentItem.listId]: {
                  ...state.columns[currentItem.listId],
                  itemIds: state.columns[currentItem.listId].itemIds.filter(
                    (id) => id !== action.id
                  ),
                },
                [action.payload.listId]: {
                  ...state.columns[action.payload.listId],
                  itemIds: [
                    ...state.columns[action.payload.listId].itemIds,
                    action.id,
                  ],
                },
              }
            : state.columns,
      }
    }

    case "DELETE_ITEM": {
      const { [action.id]: deleted, ...remainingItems } = state.items
      const updatedColumns = Object.entries(state.columns).reduce(
        (acc, [colId, col]) => ({
          ...acc,
          [colId]: {
            ...col,
            itemIds: col.itemIds.filter((id) => id !== action.id),
          },
        }),
        {} as Record<string, Column>
      )
      return {
        ...state,
        items: remainingItems,
        columns: updatedColumns,
      }
    }

    case "ADD_COLUMN": {
      return {
        ...state,
        columns: {
          ...state.columns,
          [action.payload.id]: action.payload,
        },
      }
    }

    case "UPDATE_COLUMN": {
      const currentColumn = state.columns[action.id]
      if (!currentColumn) return state
      return {
        ...state,
        columns: {
          ...state.columns,
          [action.id]: { ...currentColumn, ...action.payload },
        },
      }
    }

    case "DELETE_COLUMN": {
      const { [action.id]: deleted, ...remainingColumns } = state.columns
      const columnToDelete = state.columns[action.id]
      if (!columnToDelete) return state

      // Move items to first remaining column or create orphan handling
      const remainingColIds = Object.keys(remainingColumns)
      if (remainingColIds.length > 0 && columnToDelete.itemIds.length > 0) {
        const targetColId = remainingColIds[0]
        remainingColumns[targetColId] = {
          ...remainingColumns[targetColId],
          itemIds: [
            ...remainingColumns[targetColId].itemIds,
            ...columnToDelete.itemIds,
          ],
        }
      }

      return {
        ...state,
        columns: remainingColumns,
      }
    }

    case "MOVE_ITEM": {
      const { itemId, fromColumn, toColumn, toIndex } = action
      const fromCol = state.columns[fromColumn]
      const toCol = state.columns[toColumn]

      if (!fromCol || !toCol) return state

      const fromItemIds = fromCol.itemIds.filter((id) => id !== itemId)
      const toItemIds = [...toCol.itemIds]
      toItemIds.splice(toIndex, 0, itemId)

      // Update item's listId if moved to different column
      const updatedItem = state.items[itemId]
      const updatedItems =
        fromColumn !== toColumn && updatedItem
          ? {
              ...state.items,
              [itemId]: { ...updatedItem, listId: toColumn, position: toIndex },
            }
          : state.items

      return {
        ...state,
        items: updatedItems,
        columns: {
          ...state.columns,
          [fromColumn]: { ...fromCol, itemIds: fromItemIds },
          [toColumn]: { ...toCol, itemIds: toItemIds },
        },
      }
    }

    case "OPEN_ITEM_EDITOR": {
      return {
        ...state,
        ui: { ...state.ui, editingItem: action.id },
      }
    }

    case "CLOSE_ITEM_EDITOR": {
      return {
        ...state,
        ui: { ...state.ui, editingItem: null },
      }
    }

    case "OPEN_COLUMN_EDITOR": {
      return {
        ...state,
        ui: { ...state.ui, editingColumn: action.id },
      }
    }

    case "CLOSE_COLUMN_EDITOR": {
      return {
        ...state,
        ui: { ...state.ui, editingColumn: null },
      }
    }

    default:
      return state
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Item CRUD
  const addItem = useCallback((item: Omit<Item, "id">, id: string) => {
    dispatch({ type: "ADD_ITEM", payload: { ...item, id } })
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<Item>) => {
    dispatch({ type: "UPDATE_ITEM", id, payload: updates })
  }, [])

  const deleteItem = useCallback((id: string) => {
    dispatch({ type: "DELETE_ITEM", id })
  }, [])

  // Column CRUD
  const addColumn = useCallback(
    (column: Omit<Column, "id" | "itemIds">, id: string) => {
      dispatch({
        type: "ADD_COLUMN",
        payload: { ...column, id, itemIds: [] },
      })
    },
    []
  )

  const updateColumn = useCallback((id: string, updates: Partial<Column>) => {
    dispatch({ type: "UPDATE_COLUMN", id, payload: updates })
  }, [])

  const deleteColumn = useCallback((id: string) => {
    dispatch({ type: "DELETE_COLUMN", id })
  }, [])

  // Item movement
  const moveItem = useCallback(
    (itemId: string, fromColumn: string, toColumn: string, toIndex: number) => {
      dispatch({ type: "MOVE_ITEM", itemId, fromColumn, toColumn, toIndex })
    },
    []
  )

  // UI actions
  const openItemEditor = useCallback((id: string) => {
    dispatch({ type: "OPEN_ITEM_EDITOR", id })
  }, [])

  const closeItemEditor = useCallback(() => {
    dispatch({ type: "CLOSE_ITEM_EDITOR" })
  }, [])

  const openColumnEditor = useCallback((id: string) => {
    dispatch({ type: "OPEN_COLUMN_EDITOR", id })
  }, [])

  const closeColumnEditor = useCallback(() => {
    dispatch({ type: "CLOSE_COLUMN_EDITOR" })
  }, [])

  return {
    state,
    // Item actions
    addItem,
    updateItem,
    deleteItem,
    // Column actions
    addColumn,
    updateColumn,
    deleteColumn,
    // Movement
    moveItem,
    // UI actions
    openItemEditor,
    closeItemEditor,
    openColumnEditor,
    closeColumnEditor,
  }
}
