import { useState } from "react"

export function useEntityFormModal<T, C = unknown>() {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<T | null>(null)
  const [context, setContext] = useState<C | null>(null)

  const openCreate = (ctx?: C) => {
    setEditingId(null)
    setContext(ctx ?? null)
    setOpen(true)
  }

  const openEdit = (id: T) => {
    setEditingId(id)
    setContext(null)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    setEditingId(null)
    setContext(null)
  }

  return {
    open,
    editingId,
    context,
    openCreate,
    openEdit,
    close,
    setOpen, // important for Dialog onOpenChange binding
  }
}
