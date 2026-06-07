import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ItemInputSchema } from "@/lib/schemas"
import type { Item, Column } from "@/types/domain"
import { z } from "zod"

interface EntityFormProps {
  mode: "create" | "edit"
  entityType: "item"
  initialData?: Partial<Item>
  columns: Record<string, Column>
  onSubmit: (data: z.infer<typeof ItemInputSchema> & { listId: string }) => void
  onCancel: () => void
}

export function EntityForm({
  mode,
  entityType,
  initialData,
  columns,
  onSubmit,
  onCancel,
}: EntityFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    durationMinutes: initialData?.durationMinutes || 30,
    listId: initialData?.listId || Object.keys(columns)[0] || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const validated = ItemInputSchema.parse({
        name: formData.name,
        durationMinutes: formData.durationMinutes,
      })

      onSubmit({
        ...validated,
        listId: formData.listId,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          const path = err.path.join(".")
          newErrors[path] = err.message
        })
        setErrors(newErrors)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Task Name
        </label>
        <Input
          id="name"
          type="text"
          placeholder="Enter task name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="duration" className="block text-sm font-medium">
          Duration (minutes)
        </label>
        <Input
          id="duration"
          type="number"
          placeholder="30"
          value={formData.durationMinutes}
          step={5}
          onChange={(e) =>
            setFormData({
              ...formData,
              durationMinutes: parseInt(e.target.value) || 0,
            })
          }
          className={errors.durationMinutes ? "border-red-500" : ""}
        />
        {errors.durationMinutes && (
          <p className="text-xs text-red-500">{errors.durationMinutes}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="list" className="block text-sm font-medium">
          List
        </label>
        <Select
          value={formData.listId}
          onValueChange={(value) =>
            setFormData({ ...formData, listId: value! })
          }
        >
          <SelectTrigger id="list">
            <SelectValue>
              {columns[formData.listId]?.name || "Select a list"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(columns).map(([colId, col]) => (
              <SelectItem key={colId} value={colId}>
                {col.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{mode === "create" ? "Create" : "Update"}</Button>
      </div>
    </form>
  )
}
