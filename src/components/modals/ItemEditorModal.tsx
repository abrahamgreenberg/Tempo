import { createId } from "@paralleldrive/cuid2"
import { useMemo } from "react"
import { withDerivedPlacement } from "@/lib/board"
import { ItemForm } from "@/components/forms/ItemForm"
import { FormModal } from "@/components/modals/FormModal"
import { useBoardStore } from "@/stores/useBoardStore"
import type { ItemDraft } from "@/lib/schemas"
import type { Column, Item } from "@/types/domain"

interface ItemEditorModalProps {
  isOpen: boolean
  editingItemId: string | null
  columns: Record<string, Column>
  items: Record<string, Item>
  onClose: () => void
  initialData?: { listId?: string }
}

export function ItemEditorModal({
  isOpen,
  editingItemId,
  columns,
  items,
  onClose,
  initialData,
}: ItemEditorModalProps) {
  const addItem = useBoardStore((state) => state.addItem)
  const updateItem = useBoardStore((state) => state.updateItem)
  const formId = "item-editor-form"

  const editingItem = useMemo(() => {
    if (!editingItemId) {
      return initialData
    }

    const item = items[editingItemId]
    if (!item) {
      return undefined
    }

    return withDerivedPlacement(item, columns) ?? item
  }, [columns, editingItemId, items, initialData])

  const handleSaveItem = (data: ItemDraft) => {
    if (editingItemId) {
      updateItem(editingItemId, {
        name: data.name,
        durationMinutes: data.durationMinutes,
        listId: data.listId,
      })
      onClose()
      return
    }

    addItem(
      {
        name: data.name,
        durationMinutes: data.durationMinutes,
        listId: data.listId,
      },
      createId()
    )
    onClose()
  }

  return (
    <FormModal
      open={isOpen}
      title={editingItemId ? "Edit item" : "Create item"}
      description={
        editingItemId ? "Update item details" : "Add a new item to your list"
      }
      submitLabel={editingItemId ? "Update" : "Create"}
      formId={formId}
      onClose={onClose}
    >
      <ItemForm
        formId={formId}
        initialData={editingItem}
        columns={columns}
        onSubmit={handleSaveItem}
      />
    </FormModal>
  )
}
