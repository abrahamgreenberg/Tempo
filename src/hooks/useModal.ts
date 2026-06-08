import { useState, useCallback } from "react"

export function useModal<T>() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<T | null>(null)

  const open = useCallback((id?: T) => {
    setEditingId(id || null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setEditingId(null)
    setIsOpen(false)
  }, [])

  return { isOpen, editingId, open, close }
}
