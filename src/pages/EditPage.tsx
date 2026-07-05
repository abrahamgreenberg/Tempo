// import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react"
import { useState } from "react"
import Column from "../Column"
import Item from "../Item"

/* TODO:
- FIX EDIT FORM
- FIX ANY TYPE
- THEN WE SHOULD BE GOLDEN
 */

import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from "@/store/hooks"
import {
  selectColumns,
  selectLinks,
  selectAllItemTimes,
} from "@/store/boardSelectors"

import { deleteColumn, deleteItem } from "@/store/boardSlice"
import { useDragManager } from "@/useDragManager"
import { useEntityFormModal } from "@/hooks/useEntityFormModal"
import { EntityFormModal } from "@/components/modals/EntityFormModal"
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal"
import { ItemForm } from "@/components/forms/ItemForm"
import { ListForm } from "@/components/forms/ListForm.tsx"

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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const listModal = useEntityFormModal<string>()
  const itemModal = useEntityFormModal<string, { columnId: string }>()

  return (
    <div className="flex min-h-[100svh] w-full flex-col items-center justify-center gap-6 bg-muted/30 p-6 pb-24">
      <div className="flex w-full max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Board</h1>

          <div className="flex gap-2">
            <Button onClick={() => navigate("/app")} variant="outline">
              ← Home
            </Button>

            <Button onClick={() => listModal.openCreate()} variant="default">
              + New List
            </Button>

            <Button onClick={() => navigate("/app/preview")} variant="outline">
              Preview PDF
            </Button>
          </div>
        </div>

        <section className="h-[70vh] w-full overflow-x-auto rounded-lg border border-border/70 bg-background/95 p-5 shadow-lg sm:p-8">
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
                      onEdit={(id) => listModal.openEdit(id)}
                      onAddItem={(columnId) => {
                        itemModal.openCreate({ columnId })
                      }}
                    >
                      {itemsInColumn.map((link, index) => (
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
                            onEdit={() => itemModal.openEdit(link.itemId)}
                            onDelete={(id) => setPendingDeleteId(id)}
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

      <EntityFormModal
        modal={listModal}
        entityName="List"
        onDelete={(id) => dispatch(deleteColumn(id))}
        renderForm={({ editingId, onComplete }) => (
          <ListForm
            editingColumnId={editingId ?? undefined}
            onComplete={onComplete}
          />
        )}
      />

      <EntityFormModal
        modal={itemModal}
        entityName="Task"
        onDelete={(id) => dispatch(deleteItem(id))}
        renderForm={({ editingId, context, onComplete }) => (
          <ItemForm
            editingItemId={editingId ?? undefined}
            initialColumnId={context?.columnId}
            onComplete={onComplete}
          />
        )}
      />

      <DeleteConfirmModal
        open={pendingDeleteId != null}
        entityName="task"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (!pendingDeleteId) return
          dispatch(deleteItem(pendingDeleteId))
          setPendingDeleteId(null)
        }}
      />
    </div>
  )
}
