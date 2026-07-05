import { Controller } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { FormField } from "./FormField"
import { useEntityForm } from "@/hooks/useEntityForm"
import { Input } from "../ui/input"
import { Slider } from "../ui/slider"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { selectColumns, selectItemById } from "@/store/boardSelectors"
import { addItem, updateItem } from "@/store/boardSlice"

import { ItemSchema } from "@/store/boardTypes"
import { z } from "zod"

const ItemFormSchema = ItemSchema.extend({
  columnId: z.string().min(1),
})

type ItemFormData = z.infer<typeof ItemFormSchema>

interface ItemFormProps {
  editingItemId?: string
  initialColumnId?: string
  formId?: string
  onComplete?: () => void
}

export function ItemForm({
  editingItemId,
  initialColumnId,
  formId = "entity-form",
  onComplete,
}: ItemFormProps) {
  const dispatch = useAppDispatch()
  const columns = useAppSelector(selectColumns)
  const firstColumnId = Object.keys(columns)[0] ?? ""

  const editingItem = useAppSelector((state) =>
    editingItemId ? selectItemById(editingItemId)(state) : undefined
  )
  const editingColumnId = useAppSelector((state) =>
    editingItemId ? state.board.itemLinks[editingItemId]?.columnId : undefined
  )

  const selectedColumnId = initialColumnId ?? editingColumnId ?? firstColumnId

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useEntityForm({
    schema: ItemFormSchema,
    initialData: editingItem
      ? {
          name: editingItem.name,
          durationMinutes: editingItem.durationMinutes,
          columnId: selectedColumnId,
        }
      : {
          name: "",
          durationMinutes: 30,
          columnId: selectedColumnId,
        },
    defaultValues: {
      name: "",
      durationMinutes: 30,
      id: editingItemId ?? `item-${crypto.randomUUID()}`,
      columnId: selectedColumnId,
    },
  })

  const submit = (data: ItemFormData) => {
    if (editingItemId) {
      dispatch(
        updateItem({
          id: editingItemId,
          updates: {
            name: data.name,
            durationMinutes: data.durationMinutes,
            columnId: data.columnId, // placement update handled via ItemLink
          },
        })
      )
    } else {
      const id = `item-${crypto.randomUUID()}`

      dispatch(
        addItem({
          item: {
            id,
            name: data.name,
            durationMinutes: data.durationMinutes,
          },
          columnId: data.columnId,
        })
      )
    }

    onComplete?.()
  }

  return (
    <form id={formId} onSubmit={handleSubmit(submit)} className="space-y-4">
      {/* NAME */}
      <FormField htmlFor="name" label="Task Name" error={errors.name?.message}>
        <Input id="name" placeholder="Enter task name" {...register("name")} />
      </FormField>

      {/* DURATION */}
      <FormField
        htmlFor="duration"
        label="Duration (minutes)"
        error={errors.durationMinutes?.message}
      >
        <Controller
          control={control}
          name="durationMinutes"
          render={({ field }) => (
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>15</span>
                <span className="font-medium text-foreground">
                  {field.value} min
                </span>
                <span>240</span>
              </div>

              <Slider
                value={[field.value]}
                min={15}
                max={240}
                step={5}
                onValueChange={(val) =>
                  field.onChange(Array.isArray(val) ? (val[0] ?? 15) : val)
                }
              />

              <Input
                type="number"
                min={15}
                max={240}
                step={5}
                value={field.value}
                onChange={(e) => field.onChange(e.target.valueAsNumber || 15)}
              />
            </div>
          )}
        />
      </FormField>

      {/* COLUMN (PLACEMENT ONLY) */}
      <FormField
        htmlFor="column"
        label="Column"
        error={errors.columnId?.message}
      >
        <Controller
          control={control}
          name="columnId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="column">
                <SelectValue placeholder="Select a column">
                  {field.value
                    ? (columns[field.value]?.name ?? field.value)
                    : undefined}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {Object.entries(columns).map(([id, col]) => (
                  <SelectItem key={id} value={id}>
                    {col.name}
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
