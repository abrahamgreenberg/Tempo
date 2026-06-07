import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EntityForm } from "../forms/EntityForm"
import type { Item, Column } from "@/types/domain"
import type { z } from "zod"
import type { ItemInputSchema } from "@/lib/schemas"

interface EditModalProps {
  isOpen: boolean
  mode: "create" | "edit"
  entityType: "item"
  item?: Item
  columns: Record<string, Column>
  onClose: () => void
  onSave: (data: z.infer<typeof ItemInputSchema> & { listId: string }) => void
}

export function EditModal({
  isOpen,
  mode,
  entityType,
  item,
  columns,
  onClose,
  onSave,
}: EditModalProps) {
  const title =
    mode === "create" ? `Create ${entityType}` : `Edit ${entityType}`
  const description =
    mode === "create"
      ? `Add a new ${entityType} to your list`
      : `Update ${entityType} details`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <EntityForm
          mode={mode}
          entityType={entityType}
          initialData={item}
          columns={columns}
          onSubmit={onSave}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
