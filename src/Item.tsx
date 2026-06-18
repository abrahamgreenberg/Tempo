import { memo } from "react"
// import { useSortable } from "@dnd-kit/react/sortable"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Pencil,
  Trash2,
  Flag02FreeIcons,
  CheckmarkSquare02Icon,
  AlertIcon,
} from "@hugeicons/core-free-icons"
import type { Item as ItemType } from "@/store/boardTypes"
import type { Time } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDragManager } from "./useDragManager"

export const Item = memo(function Item({
  id,
  item,
  startTime,
  endTime,
  onEdit,
  onDelete,
  columnEndTime,
  drag,
}: {
  id: string
  item: ItemType
  startTime: Time
  endTime: Time
  columnEndTime: Time
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  drag: ReturnType<typeof useDragManager>
}) {
  const isOverColumnEnd = endTime.greaterThan(columnEndTime) // && !isDragging
  const style =
    "cursor-grab active:cursor-grabbing" +
    (isOverColumnEnd ? " border border-red-500" : "")
  return (
    <Card
      // ref={ref}
      // className={style}
      // data-dragging={isDragging}
      // style={{
      //   opacity: isDragging ? 0.5 : 1,
      // }}
      data-item-id={id}
      {...drag.bindItem(id)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{item.name}</CardTitle>
        <CardDescription>{item.durationMinutes} minutes</CardDescription>
        <CardAction className="mt-2 flex items-center gap-2">
          <Badge variant="green">
            <HugeiconsIcon icon={Flag02FreeIcons} size={16} />{" "}
            {startTime.toString()}
          </Badge>
          <Badge variant="blue">
            <HugeiconsIcon icon={CheckmarkSquare02Icon} size={16} />{" "}
            {endTime.toString()}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter>
        <div className="flex w-full items-center justify-between gap-2">
          <ButtonGroup>
            <Button
              size="sm"
              variant="secondary"
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
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(id)
              }}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <HugeiconsIcon icon={Trash2} size={16} />
            </Button>
          </ButtonGroup>
          {isOverColumnEnd && (
            <Tooltip>
              <TooltipTrigger>
                <HugeiconsIcon
                  icon={AlertIcon}
                  size={16}
                  className="text-destructive"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Task is over time block end</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardFooter>
    </Card>
  )
})

export default Item
