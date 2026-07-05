import type { useEntityFormModal } from "@/hooks/useEntityFormModal"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteConfirmModal } from "./DeleteConfirmModal"

interface EntityFormModalProps<T, C = unknown> {
  modal: ReturnType<typeof useEntityFormModal<T, C>>
  entityName: string

  renderForm: (args: {
    editingId: T | null
    context: C | null
    onComplete: () => void
  }) => React.ReactNode

  onDelete?: (id: T) => void
}

export function EntityFormModal<T, C = unknown>({
  modal,
  entityName,
  renderForm,
  onDelete,
}: EntityFormModalProps<T, C>) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const isEdit = modal.editingId != null

  const title = isEdit ? `Edit ${entityName}` : `New ${entityName}`

  const submitLabel = isEdit ? "Update" : "Create"

  return (
    <Dialog open={modal.open} onOpenChange={(o) => !o && modal.close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {renderForm({
          editingId: modal.editingId,
          context: modal.context,
          onComplete: modal.close,
        })}

        <div className="flex justify-between">
          <div>
            {isEdit && onDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  setDeleteConfirmOpen(true)
                }}
              >
                Delete
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={modal.close}>
              Cancel
            </Button>

            <Button type="submit" form="entity-form">
              {submitLabel}
            </Button>
          </div>
        </div>

        <DeleteConfirmModal
          open={deleteConfirmOpen}
          entityName={entityName}
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={() => {
            if (!isEdit || !onDelete || modal.editingId == null) return
            onDelete(modal.editingId)
            setDeleteConfirmOpen(false)
            modal.close()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
