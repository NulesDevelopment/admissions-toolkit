import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { Fragment, useMemo, useState } from 'react'
import { yesNo } from '../lib/export'
import { clickSort, matchesSearch, sortRows, type SortState } from '../lib/sort'
import type { DuplicateRow } from '../lib/types'
import { CollapsibleSection } from './CollapsibleSection'
import { SortableHeaderCell } from './SortableHeaderCell'

type SortKey =
  | 'specialty'
  | 'caseCode'
  | 'appId'
  | 'personId'
  | 'personName'
  | 'status'
  | 'claimsBudget'
  | 'claimsContract'
  | 'score'
  | 'dateMs'

type Props = {
  rows: DuplicateRow[]
  expanded: boolean
  onExpandedChange: (v: boolean) => void
  onExport: () => void
}

const sticky = {
  position: 'sticky' as const,
  left: 0,
  zIndex: 1,
  bgcolor: 'background.paper',
}

export function DuplicatesSection({
  rows,
  expanded,
  onExpandedChange,
  onExport,
}: Props) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortState<SortKey>>({ key: null, dir: 1 })

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        matchesSearch(
          query,
          r.personName,
          r.caseCode,
          r.appId,
          r.personId,
          r.specialty,
          r.status,
        ),
      ),
    [rows, query],
  )

  const sorted = useMemo(
    () =>
      sortRows(
        filtered,
        sort,
        (a, b) =>
          a.specialty.localeCompare(b.specialty, 'uk') ||
          a.caseCode.localeCompare(b.caseCode, 'uk'),
      ),
    [filtered, sort],
  )

  const groups = useMemo(() => {
    const map = new Map<
      string,
      { key: string; specialty: string; caseCode: string; rows: DuplicateRow[] }
    >()
    for (const row of sorted) {
      const key = `${row.specialty}\u0000${row.caseCode}`
      let group = map.get(key)
      if (!group) {
        group = {
          key,
          specialty: row.specialty,
          caseCode: row.caseCode,
          rows: [],
        }
        map.set(key, group)
      }
      group.rows.push(row)
    }
    return [...map.values()]
  }, [sorted])

  return (
    <CollapsibleSection
      id="stat-duplicates"
      title="Дублікати «Номер (шифр) особової справи»"
      subtitle={
        rows.length
          ? `Заяв у групах: ${rows.length}`
          : 'Дублікатів у вибраному факультеті немає'
      }
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      actions={
        <Button
          size="small"
          variant="outlined"
          onClick={onExport}
          disabled={rows.length === 0}
        >
          Експорт дублікатів CSV
        </Button>
      }
    >
      {rows.length > 0 && (
        <TextField
          size="small"
          fullWidth
          className="screen-only"
          placeholder="Пошук у дублікатах…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 1.5 }}
        />
      )}

      {rows.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          Дублікатів у вибраному факультеті немає.
        </Typography>
      ) : (
        <TableContainer
          className="print-table"
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <SortableHeaderCell
                  id="specialty"
                  label="Спеціальність"
                  sort={sort}
                  onSort={(k) => setSort((s) => clickSort(s, k))}
                  sticky
                />
                <SortableHeaderCell
                  id="caseCode"
                  label="Шифр"
                  sort={sort}
                  onSort={(k) => setSort((s) => clickSort(s, k))}
                />
                <SortableHeaderCell
                  id="appId"
                  label="Ід заявки"
                  sort={sort}
                  onSort={(k) => setSort((s) => clickSort(s, k))}
                />
                <SortableHeaderCell
                  id="personId"
                  label="Ід персони"
                  sort={sort}
                  onSort={(k) => setSort((s) => clickSort(s, k))}
                />
                <SortableHeaderCell
                  id="personName"
                  label="Вступник"
                  sort={sort}
                  onSort={(k) => setSort((s) => clickSort(s, k))}
                />
                <SortableHeaderCell
                  id="status"
                  label="Статус"
                  sort={sort}
                  onSort={(k) => setSort((s) => clickSort(s, k))}
                />
                <SortableHeaderCell
                  id="claimsBudget"
                  label="Бюджет"
                  sort={sort}
                  onSort={(k) => setSort((s) => clickSort(s, k))}
                />
                <SortableHeaderCell
                  id="claimsContract"
                  label="Контракт"
                  sort={sort}
                  onSort={(k) => setSort((s) => clickSort(s, k))}
                />
                <SortableHeaderCell
                  id="score"
                  label="Бал"
                  sort={sort}
                  onSort={(k) => setSort((s) => clickSort(s, k))}
                  align="right"
                />
                <SortableHeaderCell
                  id="dateMs"
                  label="Дата"
                  sort={sort}
                  onSort={(k) => setSort((s) => clickSort(s, k))}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map((group) => {
                const uniquePersons = new Set(
                  group.rows.map((x) => x.personId || `@app:${x.appId}`),
                ).size
                return (
                  <Fragment key={group.key}>
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        sx={{ bgcolor: 'grey.100', fontWeight: 700 }}
                      >
                        {group.caseCode} · {group.specialty} · заяв:{' '}
                        {group.rows.length}; вступників: {uniquePersons}
                      </TableCell>
                    </TableRow>
                    {group.rows.map((row, i) => (
                      <TableRow key={`${group.key}-${row.appId}-${i}`} hover>
                        <TableCell sx={sticky}>{row.specialty}</TableCell>
                        <TableCell>{row.caseCode}</TableCell>
                        <TableCell>{row.appId}</TableCell>
                        <TableCell>{row.personId}</TableCell>
                        <TableCell>{row.personName}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{yesNo(row.claimsBudget)}</TableCell>
                        <TableCell>{yesNo(row.claimsContract)}</TableCell>
                        <TableCell align="right">{row.score ?? '—'}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {row.dateText}
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                )
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={10} sx={{ fontWeight: 700 }}>
                  Разом груп: {groups.length}; заяв: {sorted.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </CollapsibleSection>
  )
}
