import { DragDropProvider } from "@dnd-kit/react"
import { move } from "@dnd-kit/helpers"
import { useCallback, useState } from "react"
import {
  createColumnItemsMap,
  resolveItemMoveOperation,
} from "@/lib/board-state"
import Column from "./Column"
import Item from "./Item"
import { useAppState } from "@/hooks/useAppState"
import { ItemEditorModal } from "@/components/modals/ItemEditorModal"

export function App() {
  const { state, moveItem, updateItem, deleteItem, addItem } = useAppState()
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [isItemEditorOpen, setIsItemEditorOpen] = useState(false)

  const handleOpenItemEditor = useCallback((id: string) => {
    setEditingItemId(id)
    setIsItemEditorOpen(true)
  }, [])

  const handleCloseItemEditor = useCallback(() => {
    setEditingItemId(null)
    setIsItemEditorOpen(false)
  }, [])

  const handleDeleteItem = useCallback(
    (id: string) => {
      deleteItem(id)
    },
    [deleteItem]
  )

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6">
      <section className="grid w-full max-w-6xl grid-cols-3 gap-5 rounded-lg border border-border/70 bg-background/95 p-5 shadow-lg sm:p-8">
        <DragDropProvider
          onDragOver={(event) => {
            const columnItemsMap = createColumnItemsMap(state.columns)
            const result = move(columnItemsMap, event)
            if (!result) {
              return
            }

            const operation = resolveItemMoveOperation(
              state.columns,
              result as Record<string, string[]>
            )
            if (operation) {
              moveItem(
                operation.itemId,
                operation.fromColumn,
                operation.toColumn,
                operation.toIndex
              )
            }
          }}
        >
          {Object.entries(state.columns).map(([columnId, column]) => (
            <Column key={columnId} id={columnId} column={column}>
              {column.itemIds.map((itemId, index) => {
                const item = state.items[itemId]
                return item ? (
                  <Item
                    key={itemId}
                    id={itemId}
                    index={index}
                    column={columnId}
                    item={item}
                    onEdit={handleOpenItemEditor}
                    onDelete={handleDeleteItem}
                  />
                ) : null
              })}
            </Column>
          ))}
        </DragDropProvider>
      </section>

      <ItemEditorModal
        isOpen={isItemEditorOpen}
        editingItemId={editingItemId}
        columns={state.columns}
        items={state.items}
        addItem={addItem}
        updateItem={updateItem}
        onClose={handleCloseItemEditor}
      />
    </div>
  )
}

export default App
