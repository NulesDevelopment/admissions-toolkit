import TableCell from '@mui/material/TableCell'
import TableSortLabel from '@mui/material/TableSortLabel'
import type { ReactNode } from 'react'
import type { SortState } from '../lib/sort'

type Props<K extends string> = {
  id: K
  label: ReactNode
  sort: SortState<K>
  onSort: (key: K) => void
  align?: 'left' | 'right' | 'center'
  sticky?: boolean
  width?: number | string
}

export function SortableHeaderCell<K extends string>({
  id,
  label,
  sort,
  onSort,
  align = 'left',
  sticky = false,
  width,
}: Props<K>) {
  const active = sort.key === id
  return (
    <TableCell
      align={align}
      sortDirection={active ? (sort.dir === 1 ? 'asc' : 'desc') : false}
      sx={{
        width,
        whiteSpace: 'nowrap',
        ...(sticky
          ? {
              position: 'sticky',
              left: 0,
              zIndex: 3,
              bgcolor: 'background.paper',
            }
          : null),
      }}
    >
      <TableSortLabel
        active={active}
        direction={active && sort.dir === -1 ? 'desc' : 'asc'}
        onClick={() => onSort(id)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  )
}
