import { z } from "zod"
import type { Time } from "@/lib/utils"

/**
 * If Time is already a runtime class (it is),
 * we treat it as an opaque type at schema level.
 */
export const TimeSchema = z.custom<Time>(
  (val) => {
    return (
      typeof val === "object" &&
      val !== null &&
      "hours" in val &&
      "minutes" in val
    )
  },
  { message: "Invalid Time object" }
)

/* -----------------------------
 * Item
 * ----------------------------- */

export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationMinutes: z.number(),
})

export type Item = z.infer<typeof ItemSchema>

/* -----------------------------
 * Column
 * ----------------------------- */

export const ColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  startTime: TimeSchema,
  endTime: TimeSchema,
  date: z.string(),
})

export type Column = z.infer<typeof ColumnSchema>

/* -----------------------------
 * ItemLink (layout model)
 * ----------------------------- */

export const ItemLinkSchema = z.object({
  itemId: z.string(),
  columnId: z.string(),
  rank: z.number(),
})

export type ItemLink = z.infer<typeof ItemLinkSchema>

/* -----------------------------
 * Item Update (for reducers/forms)
 * ----------------------------- */

export const ItemUpdateSchema = z.object({
  name: z.string().optional(),
  durationMinutes: z.number().optional(),
  columnId: z.string().optional(),
})

export type ItemUpdate = z.infer<typeof ItemUpdateSchema>

/* -----------------------------
 * Derived UI type (computed)
 * ----------------------------- */

export interface ItemTimes {
  startTime: Time
  endTime: Time
}

/* -----------------------------
 * Board State
 * ----------------------------- */

export const BoardStateSchema = z.object({
  columns: z.record(z.string(), ColumnSchema),
  items: z.record(z.string(), ItemSchema),
  itemLinks: z.record(z.string(), ItemLinkSchema),
})

export type BoardState = z.infer<typeof BoardStateSchema>
