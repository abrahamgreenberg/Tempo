import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse time string (HH:MM) into minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

/**
 * Convert minutes since midnight back to HH:MM format
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
}

/**
 * Calculate item's start and end times based on column start time and preceding item durations
 */
export function calculateItemTimes(
  columnStartTime: string,
  durationMinutes: number,
  precedingItemsDuration: number
): { startTime: string; endTime: string } {
  const columnStartMinutes = timeToMinutes(columnStartTime)
  const itemStartMinutes = columnStartMinutes + precedingItemsDuration
  const itemEndMinutes = itemStartMinutes + durationMinutes

  return {
    startTime: minutesToTime(itemStartMinutes),
    endTime: minutesToTime(itemEndMinutes),
  }
}
