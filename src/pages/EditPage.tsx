import { DragDropProvider } from "@dnd-kit/react"
import { useModal } from "@/hooks/useModal"
import Column from "../Column"
import {
  useBoardData,
  useBoardStore,
  selectItemTimesData,
} from "@/stores/useBoardStore"
import { ItemEditorModal } from "@/components/modals/ItemEditorModal"
import { ListEditorModal } from "@/components/modals/ListEditorModal"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import Item from "../Item"

// Helper component that subscribes only to its own item times
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
  // Subscribe only to this specific item's times (pre-calculated in store)
  const { startTime, endTime } = useBoardStore(selectItemTimesData(itemId))
  const item = useBoardStore((state) => state.items[itemId])
  const column = useBoardStore((state) => state.columns[columnId])

  if (!item) return null

  return (
    <Item
      id={itemId}
      index={index}
      column={columnId}
      item={item}
      startTime={startTime}
      endTime={endTime}
      onEdit={onEdit}
      onDelete={onDelete}
      columnEndTime={column.endTime}
    />
  )
}

export function EditPage() {
  const navigate = useNavigate()
  const { columns, items, deleteItem, handleDragOver, handleDragEnd } =
    useBoardData()

  const itemModal = useModal<string>()
  const listModal = useModal<string>()

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-muted/30 p-6 pb-24">
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
      <section className="grid w-full max-w-6xl grid-cols-3 gap-5 rounded-lg border border-border/70 bg-background/95 p-5 shadow-lg sm:p-8">
        <DragDropProvider onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          {Object.entries(columns)
            .sort(
              ([, a], [, b]) =>
                a.startTime.toMinutes() - b.startTime.toMinutes()
            )
            .map(([columnId, column]) => (
              <Column
                key={columnId}
                id={columnId}
                column={column}
                onEdit={listModal.open}
              >
                {column.itemIds.map((itemId, index) => (
                  <ItemWithTimes
                    key={itemId}
                    itemId={itemId}
                    index={index}
                    columnId={columnId}
                    onEdit={itemModal.open}
                    onDelete={deleteItem}
                  />
                ))}
              </Column>
            ))}
        </DragDropProvider>
      </section>

      <ItemEditorModal
        isOpen={itemModal.isOpen}
        editingItemId={itemModal.editingId}
        columns={columns}
        items={items}
        onClose={itemModal.close}
      />

      <ListEditorModal
        isOpen={listModal.isOpen}
        editingColumnId={listModal.editingId}
        columns={columns}
        onClose={listModal.close}
      />
    </div>
  )
}
