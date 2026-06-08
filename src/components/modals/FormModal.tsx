import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FormModalProps {
  open: boolean
  title: string
  description?: string
  submitLabel: string
  formId: string
  onClose: () => void
  children: ReactNode
  deleteAction?: {
    label?: string
    onDelete: () => void
  }
}

export function FormModal({
  open,
  title,
  description,
  submitLabel,
  formId,
  onClose,
  children,
  deleteAction,
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {children}

        <div className="flex justify-between gap-2">
          <div>
            {deleteAction ? (
              <Button
                type="button"
                variant="destructive"
                onClick={deleteAction.onDelete}
              >
                {deleteAction.label || "Delete"}
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form={formId}>
              {submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
