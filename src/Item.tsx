import { useSortable } from "@dnd-kit/react/sortable"

export const Item = ({
  id,
  index,
  column,
}: {
  id: string
  index: number
  column: string
}) => {
  const { ref, isDragging } = useSortable({
    id,
    index,
    type: "item",
    accept: "item",
    group: column,
  })

  return (
    <button
      className="rounded-lg border border-border/70 bg-background/95 p-4 shadow"
      ref={ref}
      data-dragging={isDragging}
    >
      {`Item ${index + 1}`}
      {/* <p className="text-sm font-medium">{`Item ${index + 1}`}</p> */}
      {/* <p className="text-xs text-muted-foreground">{id}</p> */}
    </button>
  )
}

export default Item
