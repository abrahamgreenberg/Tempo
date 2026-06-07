import { useDroppable } from "@dnd-kit/react"
import { CollisionPriority } from "@dnd-kit/abstract"
import type { Column as ColumnType } from "@/types/domain"

export const Column = ({
  children,
  id,
  column,
}: {
  children: React.ReactNode
  id: string
  column: ColumnType
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
        <h2 className="text-lg font-semibold">{column.name}</h2>
        <p className="text-xs text-muted-foreground">
          {column.startTime} - {column.endTime}
        </p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

export default Column
