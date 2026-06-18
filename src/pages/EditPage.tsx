// import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react"
import { useModal } from "@/hooks/useModal"
import { useEffect, useState } from "react"
import Column from "../Column"
import Item from "../Item"

import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from "@/store/hooks"
import {
  selectColumns,
  selectLinks,
  selectItemTimesById,
  selectAllItemTimes,
} from "@/store/boardSelectors"

import { deleteItem, updateItem } from "@/store/boardSlice"
import { useDragManager } from "@/useDragManager"

// Helper component (subscribes per item)
function ItemWithTimes({
  itemId,
  columnId,
  onEdit,
  onDelete,
  drag,
}: {
  itemId: string
  columnId: string
  index: number
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  drag: ReturnType<typeof useDragManager>
}) {
  const item = useSelector((state) => state.board.items[itemId])
  const column = useSelector((state) => state.board.columns[columnId])
  const times = useSelector((state) => selectAllItemTimes(state)[itemId])
  if (!item || !column || !times) return null

  return (
    <Item
      id={itemId}
      item={item}
      startTime={times.startTime}
      endTime={times.endTime}
      columnEndTime={column.endTime}
      onEdit={onEdit}
      onDelete={onDelete}
      drag={drag}
    />
  )
}

// const itemModal = useModal<string>()
// const listModal = useModal<string>()

// const [preselectedColumnId, setPreselectedColumnId] = useState<
//   string | undefined
// >(undefined)

// const handleAddItem = (columnId: string) => {
//   setPreselectedColumnId(columnId)
//   itemModal.open()
// }

// const handleEditItem = (itemId: string) => {
//   setPreselectedColumnId(undefined)
//   itemModal.open(itemId)
// }

// const handleCloseItemModal = () => {
//   setPreselectedColumnId(undefined)
//   itemModal.close()
// }

function ItemPreview({ itemId }: { itemId: string }) {
  const item = useSelector((state) => state.board.items[itemId])
  if (!item) return null
  return (
    <div className="w-72 rounded-md border bg-white p-3 shadow-xl">
      <div className="text-sm font-medium">{item.name}</div>
      <div className="text-xs opacity-60">{item.durationMinutes} min</div>
    </div>
  )
}

function Placeholder() {
  return (
    // can you translate left -50%, top -50% to tailwind? maybe with a wrapper div?

    <div className="h-16 w-full animate-pulse rounded-md border-2 border-dashed border-primary/70 bg-primary/30" />
  )
}

export function EditPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const columns = useSelector(selectColumns)
  const itemLinks = useSelector(selectLinks)

  const drag = useDragManager()

  return (
    <div className="flex min-h-[100svh] w-full flex-col items-center justify-center gap-6 bg-muted/30 p-6 pb-24">
      <div className="flex w-full max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Board</h1>

          <div className="flex gap-2">
            <Button onClick={() => navigate("/app")} variant="outline">
              ← Home
            </Button>

            <Button /* onClick={() => listModal.open()} */ variant="default">
              + New List
            </Button>

            <Button onClick={() => navigate("/app/preview")} variant="outline">
              Preview PDF
            </Button>
          </div>
        </div>

        <section className="h-[70vh] w-full overflow-x-auto rounded-lg border border-border/70 bg-background/95 p-5 shadow-lg sm:p-8">
          {/* <DragDropProvider onDragOver={() => {}} onDragEnd={handleDragEnd}> */}
          <div
            className="mx-auto flex h-full w-max gap-5"
            onPointerMove={drag.onPointerMove}
            onPointerUp={drag.onPointerUp}
          >
            {Object.entries(columns)
              .sort(
                ([, a], [, b]) =>
                  a.startTime.toMinutes() - b.startTime.toMinutes()
              )
              .map(([columnId, column]) => {
                const itemsInColumn = Object.values(itemLinks)
                  .filter(
                    (l) =>
                      l.columnId === columnId && l.itemId !== drag.draggingId
                  )
                  .sort((a, b) => a.rank - b.rank)

                return (
                  <div
                    key={columnId}
                    className="h-full min-h-0 w-80 flex-shrink-0"
                  >
                    <Column
                      id={columnId}
                      column={column}
                      onEdit={/* listModal.open */ undefined}
                      onAddItem={/* handleAddItem */ undefined}
                    >
                      {/* {itemsInColumn.length === 0 &&
                        drag?.placeholder?.columnId === columnId && (
                          <Placeholder />
                        )} */}

                      {itemsInColumn
                        // .filter((link) => link.itemId !== drag?.draggingId)
                        .map((link, index) => (
                          <>
                            {drag?.draggingId &&
                              drag?.placeholder?.columnId === columnId &&
                              drag?.placeholder.index === index && (
                                <Placeholder />
                              )}

                            <ItemWithTimes
                              key={link.itemId}
                              itemId={link.itemId}
                              columnId={columnId}
                              index={index}
                              drag={drag}
                              // onEdit={/* handleEditItem */ undefined}
                              onDelete={(id) => dispatch(deleteItem(id))}
                            />
                          </>
                        ))}

                      {drag?.placeholder?.columnId === columnId &&
                        drag?.placeholder.index === itemsInColumn.length && (
                          <Placeholder />
                        )}
                    </Column>
                  </div>
                )
              })}
          </div>
          {/* </DragDropProvider> */}
        </section>
      </div>

      {drag.draggingId && drag.previewPos && (
        <div
          style={{
            position: "fixed",
            left: drag.previewPos.x,
            top: drag.previewPos.y,
            pointerEvents: "none",
            zIndex: 9999,
            transform: "rotate(2deg)",
            opacity: 0.9,
          }}
        >
          <ItemPreview itemId={drag.draggingId} />
        </div>
      )}

      {/* Forms temporarily disabled */}
      {/*
      <ItemEditorModal
        isOpen={itemModal.isOpen}
        editingItemId={itemModal.editingId}
        columns={columns}
        items={items}
        onClose={handleCloseItemModal}
        initialData={
          !itemModal.editingId && preselectedColumnId
            ? { listId: preselectedColumnId }
            : undefined
        }
      />

      <ListEditorModal
        isOpen={listModal.isOpen}
        editingColumnId={listModal.editingId}
        columns={columns}
        onClose={listModal.close}
      />
      */}
    </div>
  )
}
