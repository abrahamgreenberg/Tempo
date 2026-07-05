import { useEffect, useState } from "react"
import { z } from "zod"

import { Input } from "@/components/ui/input"
import { FormField } from "./FormField"
import { TimeRangeSlider } from "./TimeRangeSlider"
import { useEntityForm } from "@/hooks/useEntityForm"
import { Time } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { selectColumnById, selectColumns } from "@/store/boardSelectors"
import { addColumn, updateColumn } from "@/store/boardSlice"
import { ColumnSchema } from "@/store/boardTypes"

const ListFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "List name is required")
    .max(100, "Name must be less than 100 characters"),
})

const ColumnSubmitSchema = ColumnSchema.refine(
  (column) => column.endTime.greaterThan(column.startTime),
  {
    path: ["endTime"],
    message: "End time must be after start time",
  }
)

type ListFormData = z.infer<typeof ListFormSchema>

interface ListFormProps {
  editingColumnId?: string
  formId?: string
  onComplete?: () => void
}

export function ListForm({
  editingColumnId,
  formId = "entity-form",
  onComplete,
}: ListFormProps) {
  const dispatch = useAppDispatch()
  const columns = useAppSelector(selectColumns)
  const editingColumn = useAppSelector((state) =>
    editingColumnId ? selectColumnById(editingColumnId)(state) : undefined
  )

  const getDefaultRange = () => ({
    startTime: new Time(9, 0),
    endTime: new Time(12, 0),
  })

  const [startTime, setStartTime] = useState<Time>(
    editingColumn?.startTime ?? getDefaultRange().startTime
  )
  const [endTime, setEndTime] = useState<Time>(
    editingColumn?.endTime ?? getDefaultRange().endTime
  )

  useEffect(() => {
    if (editingColumn) {
      setStartTime(editingColumn.startTime)
      setEndTime(editingColumn.endTime)
      return
    }

    const range = getDefaultRange()
    setStartTime(range.startTime)
    setEndTime(range.endTime)
  }, [editingColumnId, editingColumn])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useEntityForm({
    schema: ListFormSchema,
    initialData: {
      name: editingColumn?.name ?? "",
    },
    defaultValues: {
      name: "",
    },
  })

  const submit = (data: ListFormData) => {
    const id = editingColumnId ?? `col-${crypto.randomUUID()}`

    const payload = {
      id,
      name: data.name.trim(),
      startTime,
      endTime,
      date: editingColumn?.date ?? new Date().toISOString().split("T")[0],
    }

    const parsed = ColumnSubmitSchema.safeParse(payload)
    if (!parsed.success) {
      const nameIssue = parsed.error.issues.find(
        (issue) => issue.path[0] === "name"
      )
      if (nameIssue) {
        setError("name", { type: "manual", message: nameIssue.message })
      }
      return
    }

    if (editingColumnId) {
      dispatch(
        updateColumn({
          id: editingColumnId,
          updates: {
            name: payload.name,
            startTime: payload.startTime,
            endTime: payload.endTime,
            date: payload.date,
          },
        })
      )
    } else {
      dispatch(addColumn(payload))
    }

    onComplete?.()
  }

  return (
    <form id={formId} onSubmit={handleSubmit(submit)} className="space-y-6">
      <FormField htmlFor="name" label="List Name" error={errors.name?.message}>
        <Input
          id="name"
          type="text"
          placeholder="e.g., Morning, Afternoon"
          aria-invalid={errors.name ? true : undefined}
          {...register("name")}
        />
      </FormField>

      <FormField htmlFor="timeRange" label="Time Range">
        <TimeRangeSlider
          startTime={startTime}
          endTime={endTime}
          onChangeStart={setStartTime}
          onChangeEnd={setEndTime}
          columns={columns}
          excludeColumnId={editingColumnId}
        />
      </FormField>
    </form>
  )
}
