import type { Column as ColumnType } from "@/store/boardTypes"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Pencil } from "@hugeicons/core-free-icons"

export const Column = ({
  children,
  id,
  column,
  onEdit,
  onAddItem,
}: {
  children: React.ReactNode
  id: string
  column: ColumnType
  onEdit: (id: string) => void
  onAddItem?: (columnId: string) => void
}) => {
  return (
    <div
      className="flex min-h-full w-full flex-col gap-4 rounded-lg border border-border/70 bg-background/95 p-4 shadow-lg"
      data-column-id={id}
    >
      <div className="mb-2 flex-shrink-0">
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
          {column.startTime.toString()} - {column.endTime.toString()}
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 pr-1">{children}</div>
      {onAddItem && (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onAddItem(id)
          }}
          className="mt-auto w-full"
        >
          + Add Item
        </Button>
      )}
    </div>
  )
}

export default Column
