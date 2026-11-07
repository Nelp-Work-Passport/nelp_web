import { cx } from '../lib/cx'

export interface SkeletonProps {
  /** `text` is a line, `heading` a taller line, `circle` an avatar or ring. */
  variant?: 'text' | 'heading' | 'circle'
  width?: number | string
  height?: number | string
  className?: string
}

/**
 * A loading placeholder.
 *
 * Skeletons are hidden from screen readers; the region around them should
 * carry `aria-busy` so the state is announced once rather than as a pile of
 * empty boxes.
 */
export function Skeleton({ variant = 'text', width, height, className }: SkeletonProps) {
  return (
    <div
      className={cx(
        'sk',
        variant === 'heading' && 'h',
        variant === 'circle' && 'c',
        className,
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export interface SkeletonCardProps {
  lines?: number
  className?: string
}

/** A card of placeholder lines, as the loading states in the design show. */
export function SkeletonCard({ lines = 3, className }: SkeletonCardProps) {
  const widths = ['40%', undefined, '70%', '55%', '85%']
  return (
    <div
      className={cx('card col', className)}
      style={{ gap: 12 }}
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          variant={index === 0 ? 'heading' : 'text'}
          width={widths[index % widths.length]}
        />
      ))}
    </div>
  )
}
