import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import type { PriorityDetailState } from '../hooks/useStatystyka'
import { yesNo } from '../lib/export'
import { clickSort, matchesSearch, sortRows, type SortState } from '../lib/sort'
import { CollapsibleSection } from './CollapsibleSection'
import { SortableHeaderCell } from './SortableHeaderCell'

type SortKey =
  | 'personName'
  | 'personId'
  | 'score'
  | 'claimsBudget'
  | 'claimsContract'
  | 'phone'
  | 'email'
  | 'dateMs'

type Props = {
  detail: PriorityDetailState
  onClose: () => void
  onExport: () => void
}

const sticky = {
  position: 'sticky' as const,
  left: 0,
  zIndex: 1,
  bgcolor: 'background.paper',
}

export function PriorityDetailPanel({ detail, onClose, onExport }: Props) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortState<SortKey>>({ key: 'score', dir: -1 })

  const filtered = useMemo(() => {
    if (!detail) return []
    return detail.rows.filter((r) =>
      matchesSearch(
        query,
        r.personName,
        r.phone,
        r.email,
        r.personId,
        r.caseCodes.join(' '),
        r.appIds.join(' '),
      ),
    )
  }, [detail, query])

  const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort])

  if (!detail) return null

  return (
    <CollapsibleSection
      id="stat-priority-detail"
      title={`${detail.specialty} — пріоритет ${detail.priority}`}
      subtitle={`Вступників: ${detail.rows.length}; заяв: ${detail.applications}; показано: ${sorted.length}`}
      defaultExpanded
      actions={
        <>
          <Button size="small" variant="outlined" onClick={onExport}>
            Експорт CSV
          </Button>
          <Button size="small" onClick={onClose}>
            Закрити
          </Button>
        </>
      }
    >
      <TextField
        size="small"
        fullWidth
        className="screen-only"
        placeholder="Пошук: ПІБ, телефон, email, шифр…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 1.5 }}
      />

      <TableContainer
        className="print-table"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          maxHeight: 480,
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="right">№</TableCell>
              <SortableHeaderCell id="personName" label="Вступник" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} sticky />
              <SortableHeaderCell id="personId" label="Ід персони" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
              <SortableHeaderCell id="score" label="Бал" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} align="right" />
              <SortableHeaderCell id="claimsBudget" label="Бюджет" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
              <SortableHeaderCell id="claimsContract" label="Контракт" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
              <TableCell>Шифри</TableCell>
              <TableCell>Ід заявок</TableCell>
              <TableCell>Статуси</TableCell>
              <SortableHeaderCell id="phone" label="Телефон" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
              <SortableHeaderCell id="email" label="Email" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
              <SortableHeaderCell id="dateMs" label="Дата" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Немає вступників.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row, i) => (
                <TableRow key={`${row.personId}-${i}`} hover>
                  <TableCell align="right">{i + 1}</TableCell>
                  <TableCell sx={sticky}>{row.personName}</TableCell>
                  <TableCell>{row.personId}</TableCell>
                  <TableCell align="right">{row.score ?? '—'}</TableCell>
                  <TableCell>{yesNo(row.claimsBudget)}</TableCell>
                  <TableCell>{yesNo(row.claimsContract)}</TableCell>
                  <TableCell>{row.caseCodes.join(', ')}</TableCell>
                  <TableCell>{row.appIds.join(', ')}</TableCell>
                  <TableCell>{row.statuses.join(', ')}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.dateText}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </CollapsibleSection>
  )
}
