import { DragDropProvider } from "@dnd-kit/react"
import { useModal } from "@/hooks/useModal"
import { useState } from "react"
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
} from "@/store/boardSelectors"

import { deleteItem } from "@/store/boardSlice"

// Helper component (subscribes per item)
function ItemWithTimes({
  itemId,
  columnId,
  index,
  onEdit,
  onDelete,
}: {
  itemId: string
  columnId: string
  index: number
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const item = useSelector((state) => state.board.items[itemId])
  const column = useSelector((state) => state.board.columns[columnId])
  const times = useSelector(selectItemTimesById(itemId))

  if (!item || !column || !times) return null

  return (
    <Item
      id={itemId}
      index={index}
      column={columnId}
      item={item}
      startTime={times.startTime}
      endTime={times.endTime}
      columnEndTime={column.endTime}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}

export function EditPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const columns = useSelector(selectColumns)
  const itemLinks = useSelector(selectLinks)

  const itemModal = useModal<string>()
  const listModal = useModal<string>()

  const [preselectedColumnId, setPreselectedColumnId] = useState<
    string | undefined
  >(undefined)

  const handleAddItem = (columnId: string) => {
    setPreselectedColumnId(columnId)
    itemModal.open()
  }

  const handleEditItem = (itemId: string) => {
    setPreselectedColumnId(undefined)
    itemModal.open(itemId)
  }

  const handleCloseItemModal = () => {
    setPreselectedColumnId(undefined)
    itemModal.close()
  }

  return (
    <div className="flex min-h-[100svh] w-full flex-col items-center justify-center gap-6 bg-muted/30 p-6 pb-24">
      <div className="flex w-full max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Board</h1>

          <div className="flex gap-2">
            <Button onClick={() => navigate("/app")} variant="outline">
              ← Home
            </Button>

            <Button onClick={() => listModal.open()} variant="default">
              + New List
            </Button>

            <Button onClick={() => navigate("/app/preview")} variant="outline">
              Preview PDF
            </Button>
          </div>
        </div>

        <section className="h-[70vh] w-full overflow-x-auto rounded-lg border border-border/70 bg-background/95 p-5 shadow-lg sm:p-8">
          <DragDropProvider onDragOver={() => {}} onDragEnd={() => {}}>
            <div className="mx-auto flex h-full w-max gap-5">
              {Object.entries(columns)
                .sort(
                  ([, a], [, b]) =>
                    a.startTime.toMinutes() - b.startTime.toMinutes()
                )
                .map(([columnId, column]) => {
                  const itemsInColumn = Object.values(itemLinks)
                    .filter((l) => l.columnId === columnId)
                    .sort((a, b) => a.position - b.position)

                  return (
                    <div
                      key={columnId}
                      className="h-full min-h-0 w-80 flex-shrink-0"
                    >
                      <Column
                        id={columnId}
                        column={column}
                        onEdit={listModal.open}
                        onAddItem={handleAddItem}
                      >
                        {itemsInColumn.map((link, index) => (
                          <ItemWithTimes
                            key={link.itemId}
                            itemId={link.itemId}
                            columnId={columnId}
                            index={index}
                            onEdit={handleEditItem}
                            onDelete={(id) => dispatch(deleteItem(id))}
                          />
                        ))}
                      </Column>
                    </div>
                  )
                })}
            </div>
          </DragDropProvider>
        </section>
      </div>

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
