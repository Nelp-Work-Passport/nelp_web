import { cx } from '../lib/cx'
import { Skeleton } from './Skeleton'

export interface Column<Row> {
  key: string
  header: React.ReactNode
  /** Hides the header visually but keeps it for screen readers. */
  headerHidden?: boolean
  align?: 'left' | 'right'
  /** Stops the cell wrapping, for dates and amounts. */
  nowrap?: boolean
  cell: (row: Row) => React.ReactNode
}

export interface TableProps<Row> {
  caption: string
  columns: readonly Column<Row>[]
  rows: readonly Row[]
  rowKey: (row: Row) => string
  /** Greys a row out, for an expired or declined booking. */
  rowDim?: (row: Row) => boolean
  minWidth?: number
  loading?: boolean
  loadingRows?: number
  /** Shown in place of the table when there are no rows. */
  empty?: React.ReactNode
  className?: string
}

/**
 * A table in a horizontally scrollable frame, so a wide row never makes the
 * whole page scroll sideways at 390px.
 *
 * The caption names the table for screen readers; it is visually hidden
 * because the design puts a heading above instead.
 */
export function Table<Row>({
  caption,
  columns,
  rows,
  rowKey,
  rowDim,
  minWidth,
  loading,
  loadingRows = 3,
  empty,
  className,
}: TableProps<Row>) {
  if (!loading && rows.length === 0 && empty) return <>{empty}</>

  return (
    <div className={cx('tw', className)}>
      <table className="tbl" style={minWidth ? { minWidth } : undefined}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={column.align === 'right' ? { textAlign: 'right' } : undefined}
                scope="col"
              >
                {column.headerHidden ? (
                  <span className="sr-only">{column.header}</span>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: loadingRows }, (_, index) => (
                <tr key={`skeleton-${index}`}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      <Skeleton />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr key={rowKey(row)} className={cx(rowDim?.(row) && 'dim')}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cx(column.nowrap && 'nw')}
                      style={
                        column.align === 'right'
                          ? { textAlign: 'right' }
                          : undefined
                      }
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
