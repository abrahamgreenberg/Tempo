import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Time class for handling hours and minutes with utilities
 */
export class Time {
  readonly hours: number
  readonly minutes: number

  constructor(hours: number, minutes: number = 0) {
    this.hours = Math.floor(hours)
    this.minutes = Math.floor(minutes)
  }

  /**
   * Create Time from total minutes since midnight
   */
  static fromMinutes(totalMinutes: number): Time {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return new Time(hours, minutes)
  }

  /**
   * Create Time from HH:MM string
   */
  static fromString(time: string): Time {
    const [hours, minutes] = time.split(":").map(Number)
    return new Time(hours, minutes)
  }

  /**
   * Get total minutes since midnight
   */
  toMinutes(): number {
    return this.hours * 60 + this.minutes
  }

  /**
   * Convert to HH:MM string format
   */
  toString(): string {
    return `${String(this.hours).padStart(2, "0")}:${String(this.minutes).padStart(2, "0")}`
  }

  /**
   * Add minutes to this time, returns new Time
   */
  addMinutes(minutes: number): Time {
    return Time.fromMinutes(this.toMinutes() + minutes)
  }

  /**
   * Subtract minutes from this time, returns new Time
   */
  subtractMinutes(minutes: number): Time {
    return Time.fromMinutes(this.toMinutes() - minutes)
  }

  /**
   * Check equality
   */
  equals(other: Time): boolean {
    return this.hours === other.hours && this.minutes === other.minutes
  }

  /**
   * Check if this time is less than other
   */
  lessThan(other: Time): boolean {
    return this.toMinutes() < other.toMinutes()
  }

  /**
   * Check if this time is less than or equal to other
   */
  lessThanOrEqual(other: Time): boolean {
    return this.toMinutes() <= other.toMinutes()
  }

  /**
   * Check if this time is greater than other
   */
  greaterThan(other: Time): boolean {
    return this.toMinutes() > other.toMinutes()
  }

  /**
   * Check if this time is greater than or equal to other
   */
  greaterThanOrEqual(other: Time): boolean {
    return this.toMinutes() >= other.toMinutes()
  }

  /**
   * Calculate difference in minutes between two times
   */
  differenceInMinutes(other: Time): number {
    return this.toMinutes() - other.toMinutes()
  }

  /**
   * Get a copy of this time
   */
  clone(): Time {
    return new Time(this.hours, this.minutes)
  }
}

/**
 * Calculate item's start and end times based on column start time and preceding item durations
 */
export function calculateItemTimes(
  columnStartTime: Time,
  durationMinutes: number,
  precedingItemsDuration: number
): { startTime: Time; endTime: Time } {
  const startTime = columnStartTime.addMinutes(precedingItemsDuration)
  const endTime = startTime.addMinutes(durationMinutes)

  return { startTime, endTime }
}
