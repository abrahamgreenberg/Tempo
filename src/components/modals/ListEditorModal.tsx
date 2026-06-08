import { createId } from "@paralleldrive/cuid2"
import { useMemo } from "react"
import { ListForm } from "@/components/forms/ListForm"
import { FormModal } from "@/components/modals/FormModal"
import type { ColumnInput, Column } from "@/lib/schemas"

interface ListEditorModalProps {
  isOpen: boolean
  editingColumnId: string | null
  columns: Record<string, Column>
  addColumn: (column: Omit<Column, "id" | "itemIds">, id: string) => void
  updateColumn: (id: string, updates: Partial<Column>) => void
  deleteColumn: (id: string) => void
  onClose: () => void
}

export function ListEditorModal({
  isOpen,
  editingColumnId,
  columns,
  addColumn,
  updateColumn,
  deleteColumn,
  onClose,
}: ListEditorModalProps) {
  const formId = "list-editor-form"

  const editingColumn = useMemo(() => {
    if (!editingColumnId) {
      return undefined
    }
    return columns[editingColumnId]
  }, [editingColumnId, columns])

  const handleSaveColumn = (data: ColumnInput) => {
    if (editingColumnId) {
      updateColumn(editingColumnId, {
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        date: data.date,
      })
      onClose()
      return
    }

    addColumn(
      {
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        date: data.date,
        position: Object.keys(columns).length,
      },
      createId()
    )
    onClose()
  }

  const handleDelete = () => {
    if (editingColumnId) {
      deleteColumn(editingColumnId)
      onClose()
    }
  }

  return (
    <FormModal
      open={isOpen}
      title={editingColumnId ? "Edit list" : "Create list"}
      description={
        editingColumnId ? "Update list details" : "Create a new time block list"
      }
      submitLabel={editingColumnId ? "Update" : "Create"}
      formId={formId}
      onClose={onClose}
      deleteAction={
        editingColumnId
          ? {
              label: "Delete",
              onDelete: handleDelete,
            }
          : undefined
      }
    >
      <ListForm
        formId={formId}
        initialData={editingColumn}
        onSubmit={handleSaveColumn}
      />
    </FormModal>
  )
}
