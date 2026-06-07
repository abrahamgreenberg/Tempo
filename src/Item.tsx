import { useSortable } from "@dnd-kit/react/sortable"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import type { Item as ItemType } from "@/types/domain"

export const Item = ({
  id,
  index,
  column,
  item,
}: {
  id: string
  index: number
  column: string
  item: ItemType
}) => {
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
        <CardTitle className="text-base">{item.name}</CardTitle>
        <CardDescription>{item.durationMinutes} minutes</CardDescription>
      </CardHeader>
    </Card>
  )
}

export default Item
