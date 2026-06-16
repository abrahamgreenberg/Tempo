import { createId } from "@paralleldrive/cuid2"

import { ItemForm } from "@/components/forms/ItemForm"
import { FormModal } from "@/components/modals/FormModal"
import { selectItemWithLink, useBoardStore } from "@/stores/useBoardStore"
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
  onClose,
  initialData,
  columns,
}: ItemEditorModalProps) {
  const addItem = useBoardStore((s) => s.addItem)
  const updateItem = useBoardStore((s) => s.updateItem)

  const formId = "item-editor-form"

  const editingItem = useBoardStore((state) => {
    if (!editingItemId) return initialData ?? undefined

    const item = selectItemWithLink(editingItemId)(state)
    if (!item) return undefined

    return {
      name: item.name,
      durationMinutes: item.durationMinutes,
      listId: item.listId,
    }
  })

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
        columns={columns}
        formId={formId}
        initialData={editingItem}
        onSubmit={handleSaveItem}
      />
    </FormModal>
  )
}
