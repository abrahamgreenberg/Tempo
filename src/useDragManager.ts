import { useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updateItem } from "@/store/boardSlice"

type DragState = {
  itemId: string
  fromColumn: string
  toColumn: string
  toIndex: number
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
    index: number
  } | null>(null)

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragState = useRef<DragState>(null)

  const getColumnFromPoint = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)
    const col = el?.closest("[data-column-id]")
    return col?.getAttribute("data-column-id") ?? null
  }

  const getInsertIndex = (columnId: string, y: number) => {
    const items = Array.from(
      document.querySelectorAll(`[data-column-id="${columnId}"] [data-item-id]`)
    ) as HTMLElement[]

    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect()
      if (y < rect.top + rect.height / 2) return i
    }

    return items.length
  }

  const onPointerDown = (itemId: string) => (e: React.PointerEvent) => {
    document.body.style.userSelect = "none"
    document.body.style.cursor = "grabbing"

    setDraggingId(itemId)

    dragState.current = {
      itemId,
      fromColumn: itemLinks[itemId].columnId,
      toColumn: itemLinks[itemId].columnId,
      toIndex: itemLinks[itemId].rank,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return

    setPreviewPos({ x: e.clientX, y: e.clientY })

    const columnId = getColumnFromPoint(e.clientX, e.clientY)
    if (!columnId) return

    const index = getInsertIndex(columnId, e.clientY)

    dragState.current.toColumn = columnId
    dragState.current.toIndex = index

    setPlaceholder({
      columnId,
      index,
    })
  }

  const onPointerUp = () => {
    if (!dragState.current) return

    document.body.style.userSelect = ""
    document.body.style.cursor = ""

    const { itemId, toColumn, toIndex } = dragState.current

    dispatch(
      updateItem({
        id: itemId,
        updates: {
          columnId: toColumn,
          toIndex,
        },
      })
    )

    dragState.current = null
    setDraggingId(null)
  }

  return {
    draggingId,
    bindItem: (id: string) => ({
      onPointerDown: onPointerDown(id),
    }),
    onPointerMove,
    onPointerUp,
    previewPos,
    placeholder,
  }
}
