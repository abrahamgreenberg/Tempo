import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
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
  const defaultValues = useMemo(
    () => ({
      name: initialData?.name || "",
      durationMinutes: initialData?.durationMinutes || 30,
      listId: initialData?.listId || Object.keys(columns)[0] || "",
    }),
    [columns, initialData]
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemDraft>({
    resolver: zodResolver(ItemDraftSchema),
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

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
