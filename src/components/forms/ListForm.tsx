import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { ColumnInputSchema, type ColumnInput } from "@/lib/schemas"
import type { Column } from "@/types/domain"
import { FormField } from "./FormField.tsx"
import { TimeRangeSlider } from "./TimeRangeSlider"
import { useEntityForm } from "@/hooks/useEntityForm"
import { Time } from "@/lib/utils"

type ListFormData = Partial<Column>

interface ListFormProps {
  initialData?: ListFormData
  onSubmit: (data: ColumnInput) => void
  formId?: string
  columns?: Record<string, Column>
  editingColumnId?: string | null
}

// Schema for form validation - only name and date, time handled separately
const FormValidationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
})

export function ListForm({
  initialData,
  onSubmit,
  formId = "list-form",
  columns = {},
  editingColumnId,
}: ListFormProps) {
  const getTimeFromData = (timeValue: unknown): Time => {
    if (timeValue instanceof Time) return timeValue
    if (typeof timeValue === "string") return Time.fromString(timeValue)
    return new Time(9, 0)
  }

  const [startTime, setStartTime] = useState<Time>(
    getTimeFromData(initialData?.startTime)
  )
  const [endTime, setEndTime] = useState<Time>(
    getTimeFromData(initialData?.endTime)
  )

  // Track the initial data ID to only reset when switching items
  const initialDataIdRef = useRef<string | undefined>(
    initialData && "id" in initialData ? (initialData.id as string) : undefined
  )

  useEffect(() => {
    const currentId =
      initialData && "id" in initialData
        ? (initialData.id as string)
        : undefined

    // Only reset if we're switching to a different item or opening a new form
    if (currentId !== initialDataIdRef.current) {
      initialDataIdRef.current = currentId
      setStartTime(getTimeFromData(initialData?.startTime))
      setEndTime(getTimeFromData(initialData?.endTime))
    }
  }, [initialData])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useEntityForm({
    schema: FormValidationSchema,
    initialData: {
      name: initialData?.name,
      date: initialData?.date,
    },
    defaultValues: {
      name: "",
      date: new Date().toISOString().split("T")[0],
    } as never,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = (data: any) => {
    // Validate and parse the complete data through ColumnInputSchema
    const dataWithStringTimes = {
      name: data.name,
      startTime: startTime.toString(),
      endTime: endTime.toString(),
      date: data.date,
    }

    try {
      const validatedData = ColumnInputSchema.parse(dataWithStringTimes)
      onSubmit(validatedData)
    } catch (error) {
      console.error("Validation error:", error)
      throw error
    }
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      <FormField htmlFor="name" label="List Name" error={errors.name?.message}>
        <Input
          id="name"
          type="text"
          placeholder="e.g., Morning, Afternoon"
          aria-invalid={errors.name ? true : undefined}
          {...register("name")}
        />
      </FormField>

      <FormField htmlFor="date" label="Date" error={errors.date?.message}>
        <Input
          id="date"
          type="date"
          aria-invalid={errors.date ? true : undefined}
          {...register("date")}
        />
      </FormField>

      <FormField htmlFor="timeRange" label="Time Range">
        <TimeRangeSlider
          startTime={startTime}
          endTime={endTime}
          onChangeStart={setStartTime}
          onChangeEnd={setEndTime}
          columns={columns}
          excludeColumnId={editingColumnId || undefined}
        />
      </FormField>
    </form>
  )
}
