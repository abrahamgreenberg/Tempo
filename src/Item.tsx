import { memo } from "react"
import { useSortable } from "@dnd-kit/react/sortable"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Pencil, Trash2 } from "@hugeicons/core-free-icons"
import type { Item as ItemType } from "@/types/domain"

export const Item = memo(function Item({
  id,
  index,
  column,
  item,
  onEdit,
  onDelete,
}: {
  id: string
  index: number
  column: string
  item: ItemType
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    type: "item",
    accept: "item",
    group: column,
  })

  return (
    <Card
      ref={ref}
      className="cursor-grab active:cursor-grabbing"
      data-dragging={isDragging}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base">{item.name}</CardTitle>
            <CardDescription>{item.durationMinutes} minutes</CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(id)
              }}
              className="h-7 w-7 p-0"
            >
              <HugeiconsIcon icon={Pencil} size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(id)
              }}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <HugeiconsIcon icon={Trash2} size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
})

export default Item
