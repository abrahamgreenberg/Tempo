import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Time, getOccupiedTimeSlots, timeRangesIntersect } from "@/lib/utils"
import type { Column } from "@/types/domain"
import { AlertIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface TimeRangeSliderProps {
  startTime: Time
  endTime: Time
  onChangeStart: (time: Time) => void
  onChangeEnd: (time: Time) => void
  columns: Record<string, Column>
  excludeColumnId?: string
}

const SLIDER_MIN = 360 // 6:00 AM in minutes
const SLIDER_MAX = 1440 // 12:00 AM (midnight) in minutes
const SLIDER_STEP = 15 // 15 minute increments

/**
 * Convert minutes to Time object
 */
function minutesToTime(minutes: number): Time {
  return Time.fromMinutes(Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, minutes)))
}

/**
 * Get occupancy info for visual feedback
 */
function getOccupancySegments(
  columns: Record<string, Column>,
  excludeColumnId?: string
): Array<{ start: number; end: number; columnId: string }> {
  return getOccupiedTimeSlots(columns, excludeColumnId).map((slot) => ({
    start: slot.startTime.toMinutes(),
    end: slot.endTime.toMinutes(),
    columnId: slot.columnId,
  }))
}

export function TimeRangeSlider({
  startTime,
  endTime,
  onChangeStart,
  onChangeEnd,
  columns,
  excludeColumnId,
}: TimeRangeSliderProps) {
  const occupancySegments = getOccupancySegments(columns, excludeColumnId)
  const startMinutes = startTime.toMinutes()
  const endMinutes = endTime.toMinutes()

  const [hasConflict, setHasConflict] = useState(false)

  /**
   * Handle slider range change
   */
  const handleSliderChange = (values: number | readonly number[]) => {
    if (!Array.isArray(values)) return

    const [newStart, newEnd] = values
    const newStartTime = minutesToTime(newStart)
    const newEndTime = minutesToTime(newEnd)

    // Check for conflicts with other columns
    const conflict = occupancySegments.some((segment) =>
      timeRangesIntersect(
        newStartTime,
        newEndTime,
        Time.fromMinutes(segment.start),
        Time.fromMinutes(segment.end)
      )
    )

    setHasConflict(conflict)

    if (!conflict) {
      onChangeStart(newStartTime)
      onChangeEnd(newEndTime)
    }
  }

  /**
   * Handle manual time input
   */
  const handleTimeInput = (inputType: "start" | "end", timeString: string) => {
    try {
      const newTime = Time.fromString(timeString)

      if (inputType === "start") {
        // Validate: start must be before end and within range
        if (
          newTime.toMinutes() < SLIDER_MIN ||
          newTime.toMinutes() >= endTime.toMinutes()
        ) {
          setHasConflict(true)
          return
        }

        // Check for conflicts
        const conflict = occupancySegments.some((segment) =>
          timeRangesIntersect(
            newTime,
            endTime,
            Time.fromMinutes(segment.start),
            Time.fromMinutes(segment.end)
          )
        )

        setHasConflict(conflict)
        if (!conflict) {
          onChangeStart(newTime)
        }
      } else {
        // Validate: end must be after start and within range
        if (
          newTime.toMinutes() > SLIDER_MAX ||
          newTime.toMinutes() <= startTime.toMinutes()
        ) {
          setHasConflict(true)
          return
        }

        // Check for conflicts
        const conflict = occupancySegments.some((segment) =>
          timeRangesIntersect(
            startTime,
            newTime,
            Time.fromMinutes(segment.start),
            Time.fromMinutes(segment.end)
          )
        )

        setHasConflict(conflict)
        if (!conflict) {
          onChangeEnd(newTime)
        }
      }
    } catch {
      setHasConflict(true)
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Manual time inputs */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground">
            Start Time
          </label>
          <Input
            type="time"
            value={startTime.toString()}
            onChange={(e) => handleTimeInput("start", e.target.value)}
            className={hasConflict ? "border-destructive" : ""}
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground">
            End Time
          </label>
          <Input
            type="time"
            value={endTime.toString()}
            onChange={(e) => handleTimeInput("end", e.target.value)}
            className={hasConflict ? "border-destructive" : ""}
          />
        </div>
      </div>

      {/* Conflict warning */}
      {hasConflict && (
        <div className="flex items-center justify-between rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <HugeiconsIcon
            icon={AlertIcon}
            size={32}
            className="mr-2 text-destructive"
          />{" "}
          This time slot conflicts with an existing list. Please choose a
          different time.
        </div>
      )}

      {/* Range slider with occupancy visualization */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Time Range Slider
        </label>

        {/* Occupancy visualization */}
        <div className="relative h-8 rounded-md border border-border bg-muted p-1">
          {/* Occupied segments - grayed out */}
          {occupancySegments.map((segment, idx) => {
            const percentStart =
              ((segment.start - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100
            const percentEnd =
              ((segment.end - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100
            const width = percentEnd - percentStart

            return (
              <div
                key={idx}
                className="absolute top-1 h-6 rounded bg-muted-foreground/30"
                style={{
                  left: `${percentStart}%`,
                  width: `${Math.max(1, width)}%`,
                }}
                title={`Occupied: ${Time.fromMinutes(segment.start).toString()} - ${Time.fromMinutes(segment.end).toString()}`}
              />
            )
          })}

          {/* Current selection highlight */}
          <div
            className="absolute top-1 h-6 rounded bg-primary/20"
            style={{
              left: `${((startMinutes - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%`,
              width: `${((endMinutes - startMinutes) / (SLIDER_MAX - SLIDER_MIN)) * 100}%`,
            }}
          />
        </div>

        {/* Slider */}
        <Slider
          defaultValue={[startMinutes, endMinutes]}
          value={[startMinutes, endMinutes]}
          onValueChange={handleSliderChange}
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          className="w-full"
        />

        {/* Time labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>6:00 AM</span>
          <span>12:00 AM</span>
        </div>
      </div>

      {/* Current selection display */}
      <div className="rounded-md bg-muted p-2 text-sm">
        <p className="text-muted-foreground">
          Selected:{" "}
          <span className="font-medium text-foreground">
            {startTime.toString()}
          </span>{" "}
          to{" "}
          <span className="font-medium text-foreground">
            {endTime.toString()}
          </span>
        </p>
      </div>
    </div>
  )
}
