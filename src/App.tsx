import { DragDropProvider } from "@dnd-kit/react"
import { move } from "@dnd-kit/helpers"
import Column from "./Column"
import Item from "./Item"
import { useAppState } from "@/hooks/useAppState"

export function App() {
  const { state, moveItem } = useAppState()

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
                  />
                ) : null
              })}
            </Column>
          ))}
        </DragDropProvider>
      </section>
    </div>
  )
}

export default App
