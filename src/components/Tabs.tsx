import { cx } from '../lib/cx'

export interface TabItem<T extends string> {
  id: T
  label: string
  /** The count shown beside the label. */
  count?: number
  disabled?: boolean
}

export interface TabsProps<T extends string> {
  items: readonly TabItem<T>[]
  value: T
  onChange: (id: T) => void
  /** Describes the set for screen readers, e.g. "Bookings". */
  label: string
  className?: string
}

/**
 * A row of tabs with arrow-key navigation, as the tablist pattern expects:
 * Tab enters the set, then Left and Right move between tabs and select.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
}: TabsProps<T>) {
  const enabled = items.filter((item) => !item.disabled)

  const move = (delta: number) => {
    if (enabled.length === 0) return
    const current = enabled.findIndex((item) => item.id === value)
    const next = (current + delta + enabled.length) % enabled.length
    onChange(enabled[next].id)
  }

  return (
    <div className={cx('tabs', className)} role="tablist" aria-label={label}>
      {items.map((item) => {
        const selected = item.id === value
        return (
          <button
            key={item.id}
            className={cx('tab', selected && 'on')}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={selected}
            aria-controls={`panel-${item.id}`}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                event.preventDefault()
                move(1)
              } else if (event.key === 'ArrowLeft') {
                event.preventDefault()
                move(-1)
              }
            }}
          >
            {item.label}
            {item.count !== undefined ? (
              <span className="n">{item.count}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export interface TabPanelProps<T extends string> {
  id: T
  children: React.ReactNode
  className?: string
}

export function TabPanel<T extends string>({
  id,
  children,
  className,
}: TabPanelProps<T>) {
  return (
    <div
      className={className}
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
    >
      {children}
    </div>
  )
}
