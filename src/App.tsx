import { DragDropProvider } from "@dnd-kit/react"
import { useModal } from "@/hooks/useModal"
import Column from "./Column"
import Item from "./Item"
import { useBoardData } from "@/stores/useBoardStore"
import { ItemEditorModal } from "@/components/modals/ItemEditorModal"
import { ListEditorModal } from "@/components/modals/ListEditorModal"
import { Button } from "@/components/ui/button"

export function App() {
  const { columns, items, deleteItem, handleDragOver } = useBoardData()

  const itemModal = useModal<string>()
  const listModal = useModal<string>()

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-muted/30 p-6">
      <Button onClick={() => listModal.open()} variant="default">
        + New List
      </Button>
      <section className="grid w-full max-w-6xl grid-cols-3 gap-5 rounded-lg border border-border/70 bg-background/95 p-5 shadow-lg sm:p-8">
        <DragDropProvider onDragOver={handleDragOver}>
          {Object.entries(columns).map(([columnId, column]) => (
            <Column
              key={columnId}
              id={columnId}
              column={column}
              onEdit={listModal.open}
            >
              {column.itemIds.map((itemId, index) => {
                const item = items[itemId]
                return item ? (
                  <Item
                    key={itemId}
                    id={itemId}
                    index={index}
                    column={columnId}
                    item={item}
                    onEdit={itemModal.open}
                    onDelete={deleteItem}
                  />
                ) : null
              })}
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

export default App
