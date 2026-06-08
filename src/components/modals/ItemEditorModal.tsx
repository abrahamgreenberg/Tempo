import { createId } from "@paralleldrive/cuid2"
import { useMemo } from "react"
import { withDerivedPlacement } from "@/lib/board"
import { ItemForm } from "@/components/forms/ItemForm"
import { FormModal } from "@/components/modals/FormModal"
import type { ItemDraft } from "@/lib/schemas"
import type { Column, Item, ItemUpdate, NewItem } from "@/types/domain"

interface ItemEditorModalProps {
  isOpen: boolean
  editingItemId: string | null
  columns: Record<string, Column>
  items: Record<string, Item>
  addItem: (item: NewItem, id: string) => void
  updateItem: (id: string, updates: ItemUpdate) => void
  onClose: () => void
}

export function ItemEditorModal({
  isOpen,
  editingItemId,
  columns,
  items,
  addItem,
  updateItem,
  onClose,
}: ItemEditorModalProps) {
  const formId = "item-editor-form"

  const editingItem = useMemo(
    () => {
      if (!editingItemId) {
        return undefined
      }

      const item = items[editingItemId]
      if (!item) {
        return undefined
      }

      return withDerivedPlacement(item, columns) ?? item
    },
    [columns, editingItemId, items]
  )

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