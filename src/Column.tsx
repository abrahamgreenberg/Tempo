import { useDroppable } from "@dnd-kit/react"
import { CollisionPriority } from "@dnd-kit/abstract"
import type { Column as ColumnType } from "@/types/domain"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Pencil } from "@hugeicons/core-free-icons"

export const Column = ({
  children,
  id,
  column,
  onEdit,
}: {
  children: React.ReactNode
  id: string
  column: ColumnType
  onEdit: (id: string) => void
}) => {
  const { ref } = useDroppable({
    id,
    type: "column",
    accept: "item",
    collisionPriority: CollisionPriority.Low,
  })

  return (
    <div
      className="flex h-full w-full flex-col gap-4 rounded-lg border border-border/70 bg-background/95 p-4 shadow-lg"
      ref={ref}
    >
      <div className="mb-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold">{column.name}</h2>
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
        </div>
        <p className="text-xs text-muted-foreground">
          {column.startTime} - {column.endTime}
        </p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

export default Column
