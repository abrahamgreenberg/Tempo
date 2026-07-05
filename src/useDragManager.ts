import { useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updateItem } from "@/store/boardSlice"

type DragState = {
  itemId: string
  fromColumn: string
  toColumn: string
  beforeItemId: string | null
} | null

export function useDragManager() {
  const dispatch = useAppDispatch()
  //   const columns = useAppSelector((s) => s.board.columns)
  const itemLinks = useAppSelector((s) => s.board.itemLinks)

  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(
    null
  )
  const [placeholder, setPlaceholder] = useState<{
    columnId: string
    beforeItemId: string | null
  } | null>(null)

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragState = useRef<DragState>(null)

  const getColumnFromPoint = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)
    const col = el?.closest("[data-column-id]")
    return col?.getAttribute("data-column-id") ?? null
  }

  const getInsertBeforeItemId = (columnId: string, y: number) => {
    const items = Array.from(
      document.querySelectorAll(`[data-column-id="${columnId}"] [data-item-id]`)
    ) as HTMLElement[]

    for (const item of items) {
      const rect = item.getBoundingClientRect()
      if (y < rect.top + rect.height / 2) {
        return item.getAttribute("data-item-id")
      }
    }

    return null
  }

  const onPointerDown = (itemId: string) => (e: React.PointerEvent) => {
    document.body.style.userSelect = "none"
    document.body.style.cursor = "grabbing"

    setDraggingId(itemId)

    dragState.current = {
      itemId,
      fromColumn: itemLinks[itemId].columnId,
      toColumn: itemLinks[itemId].columnId,
      beforeItemId: null,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return

    setPreviewPos({ x: e.clientX, y: e.clientY })

    const columnId = getColumnFromPoint(e.clientX, e.clientY)
    if (!columnId) return

    const beforeItemId = getInsertBeforeItemId(columnId, e.clientY)

    dragState.current.toColumn = columnId
    dragState.current.beforeItemId = beforeItemId

    setPlaceholder({
      columnId,
      beforeItemId,
    })
  }

  const resetDragUI = () => {
    document.body.style.userSelect = ""
    document.body.style.cursor = ""

    dragState.current = null
    setDraggingId(null)
    setPreviewPos(null)
    setPlaceholder(null)
  }

  const onPointerUp = () => {
    if (!dragState.current) {
      resetDragUI()
      return
    }

    const { itemId, toColumn, beforeItemId } = dragState.current

    dispatch(
      updateItem({
        id: itemId,
        updates: {
          columnId: toColumn,
          beforeItemId,
        },
      })
    )

    resetDragUI()
  }

  const onPointerCancel = () => {
    resetDragUI()
  }

  return {
    draggingId,
    bindItem: (id: string) => ({
      onPointerDown: onPointerDown(id),
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture: onPointerCancel,
    }),
    onPointerMove,
    onPointerUp,
    previewPos,
    placeholder,
  }
}
