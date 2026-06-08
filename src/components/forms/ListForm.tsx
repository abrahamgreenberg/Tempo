import { Input } from "@/components/ui/input"
import { ColumnInputSchema, type ColumnInput } from "@/lib/schemas"
import type { Column } from "@/types/domain"
import { FormField } from "./FormField.tsx"
import { useEntityForm } from "@/hooks/useEntityForm"

type ListFormData = Partial<Column>

interface ListFormProps {
  initialData?: ListFormData
  onSubmit: (data: ColumnInput) => void
  formId?: string
}

export function ListForm({
  initialData,
  onSubmit,
  formId = "list-form",
}: ListFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useEntityForm({
    schema: ColumnInputSchema,
    initialData,
    defaultValues: {
      name: "",
      startTime: "09:00",
      endTime: "17:00",
      date: new Date().toISOString().split("T")[0],
    },
  })

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField htmlFor="name" label="List Name" error={errors.name?.message}>
        <Input
          id="name"
          type="text"
          placeholder="e.g., Morning, Afternoon"
          aria-invalid={errors.name ? true : undefined}
          {...register("name")}
        />
      </FormField>

      <FormField
        htmlFor="startTime"
        label="Start Time"
        error={errors.startTime?.message}
      >
        <Input
          id="startTime"
          type="time"
          aria-invalid={errors.startTime ? true : undefined}
          {...register("startTime")}
        />
      </FormField>

      <FormField
        htmlFor="endTime"
        label="End Time"
        error={errors.endTime?.message}
      >
        <Input
          id="endTime"
          type="time"
          aria-invalid={errors.endTime ? true : undefined}
          {...register("endTime")}
        />
      </FormField>
    </form>
  )
}
