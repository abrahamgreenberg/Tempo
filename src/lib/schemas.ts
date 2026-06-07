import { z } from "zod"

export const ItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  durationMinutes: z
    .number()
    .int()
    .positive("Duration must be a positive number"),
  listId: z.string().min(1, "List ID is required"),
  position: z.number().int().nonnegative("Position must be non-negative"),
})

export const ItemInputSchema = ItemSchema.omit({
  id: true,
  listId: true,
  position: true,
})

export const ColumnSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  startTime: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Start time must be in HH:MM format"
    ),
  endTime: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "End time must be in HH:MM format"
    ),
  position: z.number().int().nonnegative("Position must be non-negative"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  itemIds: z.array(z.string()),
})

export const ColumnInputSchema = ColumnSchema.omit({
  id: true,
  itemIds: true,
  position: true,
})

export type Item = z.infer<typeof ItemSchema>
export type ItemInput = z.infer<typeof ItemInputSchema>
export type Column = z.infer<typeof ColumnSchema>
export type ColumnInput = z.infer<typeof ColumnInputSchema>
