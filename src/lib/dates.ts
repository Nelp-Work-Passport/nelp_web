/**
 * Times come from the API in UTC. They are shown in Africa/Nairobi, because
 * that is where the deliveries happen.
 */

const ZONE = 'Africa/Nairobi'

const time = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZONE,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const dayAndTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZONE,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const day = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZONE,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const monthAndYear = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZONE,
  month: 'short',
  year: 'numeric',
})

/** `9:00 am` */
export function formatTime(iso: string): string {
  return time.format(new Date(iso))
}

/** `Mon 9 Nov, 9:00 am` */
export function formatDateTime(iso: string): string {
  return dayAndTime.format(new Date(iso)).replace(',', ',')
}

/** `Mon 9 Nov` */
export function formatDay(iso: string): string {
  return day.format(new Date(iso))
}

/** `Nov 2026` */
export function formatMonth(iso: string): string {
  return monthAndYear.format(new Date(iso))
}

/**
 * `Today, 9:00 am` when it is today, otherwise the full day.
 *
 * Used where a list mixes today's work with earlier work, so "today" does
 * not have to be worked out from a date.
 */
export function formatRelativeDay(iso: string): string {
  const date = new Date(iso)
  if (day.format(date) === day.format(new Date())) {
    return `Today, ${formatTime(iso)}`
  }
  return formatDateTime(iso)
}

/** The local datetime value an `<input type="datetime-local">` wants. */
export function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * Turns a datetime-local value into the offset-bearing ISO string the API
 * requires. A value without an offset is rejected by the API, so this never
 * sends a bare local time.
 */
export function fromLocalInputValue(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date')
  return toOffsetIso(date)
}

export function toOffsetIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  )
}
