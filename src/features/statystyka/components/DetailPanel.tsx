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
import type { DetailState } from '../hooks/useStatystyka'
import { yesNo } from '../lib/export'
import { clickSort, matchesSearch, sortRows, type SortState } from '../lib/sort'
import type { PublicAppRecord } from '../lib/types'
import { CollapsibleSection } from './CollapsibleSection'
import { SortableHeaderCell } from './SortableHeaderCell'

type SortKey =
  | 'personName'
  | 'phone'
  | 'email'
  | 'personId'
  | 'appId'
  | 'status'
  | 'claimsBudget'
  | 'claimsContract'
  | 'appScore'
  | 'caseCode'
  | 'dateMs'

type Props = {
  detail: DetailState
  onClose: () => void
  onExport: () => void
}

const sticky = {
  position: 'sticky' as const,
  left: 0,
  zIndex: 1,
  bgcolor: 'background.paper',
}

export function DetailPanel({ detail, onClose, onExport }: Props) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortState<SortKey>>({ key: 'dateMs', dir: -1 })

  const filtered = useMemo(() => {
    if (!detail) return []
    return detail.rows.filter((r) =>
      matchesSearch(
        query,
        r.personName,
        r.phone,
        r.email,
        r.personId,
        r.appId,
        r.caseCode,
      ),
    )
  }, [detail, query])

  const sorted = useMemo(
    () => sortRows(filtered, sort),
    [filtered, sort],
  )

  if (!detail) return null

  return (
    <CollapsibleSection
      id="stat-detail"
      title={`${detail.specialty} — ${detail.label}`}
      subtitle={`Вступників: ${detail.persons}; записів: ${detail.apps}; показано: ${sorted.length}`}
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
              <SortableHeaderCell id="personName" label="Вступник" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} sticky />
              <SortableHeaderCell id="phone" label="Телефон" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
              <SortableHeaderCell id="email" label="Email" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
              <SortableHeaderCell id="personId" label="Ід персони" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
              <SortableHeaderCell id="appId" label="Ід заявки" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
              <SortableHeaderCell id="status" label="Статус" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
              <SortableHeaderCell id="claimsBudget" label="Бюджет" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
              <SortableHeaderCell id="claimsContract" label="Контракт" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
              <SortableHeaderCell id="appScore" label="Бал" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} align="right" />
              <SortableHeaderCell id="caseCode" label="Шифр" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
              <SortableHeaderCell id="dateMs" label="Дата" sort={sort} onSort={(k) => setSort((s) => clickSort(s, k))} />
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Немає записів.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row: PublicAppRecord, i) => (
                <TableRow key={`${row.appId}-${i}`} hover>
                  <TableCell sx={sticky}>{row.personName}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.personId}</TableCell>
                  <TableCell>{row.appId}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{yesNo(row.claimsBudget)}</TableCell>
                  <TableCell>{yesNo(row.claimsContract)}</TableCell>
                  <TableCell align="right">{row.appScore ?? '—'}</TableCell>
                  <TableCell>{row.caseCode}</TableCell>
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
