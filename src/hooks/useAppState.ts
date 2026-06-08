import { useReducer, useCallback } from "react"
import {
  addItemToBoard,
  deleteColumnFromBoard,
  deleteItemFromBoard,
  moveItemInBoard,
  updateColumnInBoard,
  updateItemInBoard,
} from "@/lib/board-state"
import type {
  AppState,
  AppAction,
  Column,
  ItemUpdate,
  NewItem,
} from "@/types/domain"

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
    },
    pqr6stu7vwx8yz9abc0def: {
      id: "pqr6stu7vwx8yz9abc0def",
      name: "Study Block",
      durationMinutes: 120,
    },
    ghi2jkl3mno4pqr5stu6: {
      id: "ghi2jkl3mno4pqr5stu6",
      name: "Wrap-up",
      durationMinutes: 30,
    },
  },
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_ITEM": {
      return addItemToBoard(state, action.payload)
    }

    case "UPDATE_ITEM": {
      return updateItemInBoard(state, action.id, action.payload)
    }

    case "DELETE_ITEM": {
      return deleteItemFromBoard(state, action.id)
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
      return updateColumnInBoard(state, action.id, action.payload)
    }

    case "DELETE_COLUMN": {
      return deleteColumnFromBoard(state, action.id)
    }

    case "MOVE_ITEM": {
      return moveItemInBoard(state, action)
    }

    default:
      return state
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Item CRUD
  const addItem = useCallback((item: NewItem, id: string) => {
    const { listId, ...itemData } = item
    dispatch({
      type: "ADD_ITEM",
      payload: { item: { ...itemData, id }, listId },
    })
  }, [])

  const updateItem = useCallback((id: string, updates: ItemUpdate) => {
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
  }
}
