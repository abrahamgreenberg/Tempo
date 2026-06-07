import { DragDropProvider } from "@dnd-kit/react"
import { move } from "@dnd-kit/helpers"
import { useState } from "react"
import Column from "./Column"
import Item from "./Item"
import { useAppState } from "@/hooks/useAppState"
import { EditModal } from "@/components/modals/EditModal"
import type { ItemInputSchema } from "@/lib/schemas"
import type { z } from "zod"

export function App() {
  const {
    state,
    moveItem,
    updateItem,
    deleteItem,
    addItem,
    openItemEditor,
    closeItemEditor,
  } = useAppState()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const handleEditItem = (id: string) => {
    setEditingItemId(id)
    setIsModalOpen(true)
  }

  const handleDeleteItem = (id: string) => {
    deleteItem(id)
  }

  const handleSaveItem = (
    data: z.infer<typeof ItemInputSchema> & { listId: string }
  ) => {
    if (editingItemId) {
      // Update existing item
      updateItem(editingItemId, {
        name: data.name,
        durationMinutes: data.durationMinutes,
        listId: data.listId,
      })
    } else {
      // Create new item - generate a simple ID for demo
      const newId = `itm_${Date.now()}`
      addItem(
        {
          name: data.name,
          durationMinutes: data.durationMinutes,
          listId: data.listId,
          position: 0,
        },
        newId
      )
    }
    setIsModalOpen(false)
    setEditingItemId(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItemId(null)
  }

  const editingItem = editingItemId ? state.items[editingItemId] : undefined

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6">
      <section className="grid w-full max-w-6xl grid-cols-3 gap-5 rounded-lg border border-border/70 bg-background/95 p-5 shadow-lg sm:p-8">
        <DragDropProvider
          onDragOver={(event) => {
            // Extract itemIds from columns into the format dnd-kit expects
            const columnItemsMap = Object.entries(state.columns).reduce(
              (acc, [colId, col]) => ({
                ...acc,
                [colId]: col.itemIds,
              }),
              {} as Record<string, string[]>
            )

            const result = move(columnItemsMap, event)
            if (result) {
              // Find what changed and dispatch moveItem
              const entries = Object.entries(result)
              for (const [colId, newItemIds] of entries) {
                const oldItemIds = state.columns[colId].itemIds
                const newIds = newItemIds as string[]
                if (JSON.stringify(oldItemIds) !== JSON.stringify(newIds)) {
                  // Find the item that was added to this column
                  const movedItem = newIds.find(
                    (id) => !oldItemIds.includes(id)
                  )
                  if (movedItem) {
                    // Find which column it came from
                    for (const [oldColId, oldIds] of Object.entries(
                      state.columns
                    )) {
                      if (
                        oldIds.itemIds.includes(movedItem) &&
                        oldColId !== colId
                      ) {
                        moveItem(
                          movedItem,
                          oldColId,
                          colId,
                          newIds.indexOf(movedItem)
                        )
                        return
                      }
                    }
                  }
                }
              }
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
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                  />
                ) : null
              })}
            </Column>
          ))}
        </DragDropProvider>
      </section>

      <EditModal
        isOpen={isModalOpen}
        mode={editingItemId ? "edit" : "create"}
        entityType="item"
        item={editingItem}
        columns={state.columns}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
      />
    </div>
  )
}

export default App
