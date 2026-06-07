import { useDroppable } from "@dnd-kit/react"
import { CollisionPriority } from "@dnd-kit/abstract"

export const Column = ({
  children,
  id,
}: {
  children: React.ReactNode
  id: string
}) => {
  const { isDropTarget, ref } = useDroppable({
    id,
    type: "column",
    accept: "item",
    collisionPriority: CollisionPriority.Low,
  })

  const style = isDropTarget ? { background: "#00000030" } : undefined

  return (
    <div
      className="flex h-full w-full flex-col gap-4 rounded-lg border border-border/70 bg-background/95 p-4 shadow-lg"
      ref={ref}
      style={style}
    >
      <h2 className="text-lg font-semibold">{`Column ${id}`}</h2>
      {children}
    </div>
  )
}

export default Column
