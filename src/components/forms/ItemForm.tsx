import { Controller } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ItemDraftSchema, type ItemDraft } from "@/lib/schemas"
import type { Column, Item } from "@/types/domain"
import { FormField } from "./FormField.tsx"
import { useEntityForm } from "@/hooks/useEntityForm"
import { Input } from "../ui/input"

type ItemFormData = Partial<Item> & { listId?: string }

interface ItemFormProps {
  initialData?: ItemFormData
  columns: Record<string, Column>
  onSubmit: (data: ItemDraft) => void
  formId?: string
}

export function ItemForm({
  initialData,
  columns,
  onSubmit,
  formId = "item-form",
}: ItemFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useEntityForm({
    schema: ItemDraftSchema,
    initialData,
    defaultValues: {
      name: "",
      durationMinutes: 30,
      listId: Object.keys(columns)[0] || "",
    },
  })

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField htmlFor="name" label="Task Name" error={errors.name?.message}>
        <Input
          id="name"
          type="text"
          placeholder="Enter task name"
          aria-invalid={errors.name ? true : undefined}
          {...register("name")}
        />
      </FormField>

      <FormField
        htmlFor="duration"
        label="Duration (minutes)"
        error={errors.durationMinutes?.message}
      >
        <Input
          id="duration"
          type="number"
          placeholder="30"
          step={5}
          aria-invalid={errors.durationMinutes ? true : undefined}
          {...register("durationMinutes", { valueAsNumber: true })}
        />
      </FormField>

      <FormField htmlFor="list" label="List" error={errors.listId?.message}>
        <Controller
          control={control}
          name="listId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="list"
                aria-invalid={errors.listId ? true : undefined}
              >
                <SelectValue>
                  {columns[field.value]?.name || "Select a list"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(columns).map(([columnId, column]) => (
                  <SelectItem key={columnId} value={columnId}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
    </form>
  )
}
