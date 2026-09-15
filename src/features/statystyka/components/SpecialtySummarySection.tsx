import { Button, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, TextField } from '@mui/material'
import { useMemo, useState } from 'react'
import { clickSort, sortRows, type SortState } from '../lib/sort'
import type { DetailKind, SpecialtySummary } from '../lib/types'
import { CollapsibleSection } from './CollapsibleSection'
import { SortableHeaderCell } from './SortableHeaderCell'

type SummarySortKey =
  | 'specialty'
  | 'threshold'
  | 'persons'
  | 'above'
  | 'below'
  | 'budget'
  | 'contractOnly'
  | 'claimsBudgetBelow130'
  | 'college'
  | 'apps'
  | 'cancelledByApplicant'
  | 'cancelledPriority'
  | 'duplicateCodes'

type Props = {
  rows: SpecialtySummary[]
  expanded: boolean
  onExpandedChange: (v: boolean) => void
  onExport: () => void
  onThresholdChange: (specialty: string, value: number) => void
  onOpenDetail: (
    specialty: string,
    kind: DetailKind,
    threshold: number,
  ) => void
}

function CountBtn({
  value,
  onClick,
}: {
  value: number
  onClick: () => void
}) {
  return (
    <Button
      size="small"
      disabled={value === 0}
      onClick={onClick}
      sx={{
        minWidth: 36,
        px: 0.5,
        fontWeight: 700,
        textDecoration: value === 0 ? 'none' : 'underline',
      }}
    >
      {value}
    </Button>
  )
}

function sum(rows: SpecialtySummary[], key: keyof SpecialtySummary) {
  return rows.reduce((acc, row) => acc + Number(row[key] || 0), 0)
}

const stickyCell = {
  position: 'sticky' as const,
  left: 0,
  zIndex: 1,
  bgcolor: 'background.paper',
}

export function SpecialtySummarySection({
  rows,
  expanded,
  onExpandedChange,
  onExport,
  onThresholdChange,
  onOpenDetail,
}: Props) {
  const [sort, setSort] = useState<SortState<SummarySortKey>>({
    key: null,
    dir: 1,
  })

  const sorted = useMemo(
    () =>
      sortRows(rows, sort, (a, b) =>
        a.specialty.localeCompare(b.specialty, 'uk'),
      ),
    [rows, sort],
  )

  const onSort = (key: SummarySortKey) => setSort((s) => clickSort(s, key))

  return (
    <CollapsibleSection
      id="stat-table"
      title="Показники по спеціальностях"
      subtitle="Клік по числу відкриває детальний список; клік по заголовку — сортування"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      actions={
        <Button size="small" variant="outlined" onClick={onExport}>
          Експорт підсумку CSV
        </Button>
      }
    >
      <TableContainer
        className="print-table"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflowX: 'auto',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <SortableHeaderCell
                id="specialty"
                label="Спеціальність"
                sort={sort}
                onSort={onSort}
                sticky
              />
              <SortableHeaderCell
                id="threshold"
                label="Поріг"
                sort={sort}
                onSort={onSort}
                align="center"
              />
              <SortableHeaderCell id="persons" label="Вступників" sort={sort} onSort={onSort} align="right" />
              <SortableHeaderCell id="above" label="≥ порогу" sort={sort} onSort={onSort} align="right" />
              <SortableHeaderCell id="below" label="< порогу" sort={sort} onSort={onSort} align="right" />
              <SortableHeaderCell id="budget" label="Бюджет ≥130" sort={sort} onSort={onSort} align="right" />
              <SortableHeaderCell id="contractOnly" label="Контракт <130" sort={sort} onSort={onSort} align="right" />
              <SortableHeaderCell id="claimsBudgetBelow130" label="Бюджет, але <130" sort={sort} onSort={onSort} align="right" />
              <SortableHeaderCell id="college" label="Коледж" sort={sort} onSort={onSort} align="right" />
              <SortableHeaderCell id="apps" label="Чинних" sort={sort} onSort={onSort} align="right" />
              <SortableHeaderCell id="cancelledByApplicant" label="Скас. вступн." sort={sort} onSort={onSort} align="right" />
              <SortableHeaderCell id="cancelledPriority" label="Втрата пріор." sort={sort} onSort={onSort} align="right" />
              <SortableHeaderCell id="duplicateCodes" label="Дублікати" sort={sort} onSort={onSort} align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Немає даних.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row) => (
                <TableRow key={row.specialty} hover>
                  <TableCell sx={{ ...stickyCell, minWidth: 180 }}>
                    {row.specialty}
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={row.threshold}
                      slotProps={{ htmlInput: { min: 101, max: 199, step: 1 } }}
                      onChange={(e) =>
                        onThresholdChange(row.specialty, Number(e.target.value))
                      }
                      sx={{ width: 72 }}
                      className="screen-only"
                    />
                    <span className="print-only">{row.threshold}</span>
                  </TableCell>
                  {(
                    [
                      ['persons', row.persons],
                      ['above', row.above],
                      ['below', row.below],
                      ['budget', row.budget],
                      ['contractOnly', row.contractOnly],
                      ['claimsBudgetBelow130', row.claimsBudgetBelow130],
                      ['college', row.college],
                      ['apps', row.apps],
                      ['cancelledByApplicant', row.cancelledByApplicant],
                      ['cancelledPriority', row.cancelledPriority],
                      ['duplicates', row.duplicateCodes],
                    ] as const
                  ).map(([kind, value]) => (
                    <TableCell key={kind} align="right">
                      <CountBtn
                        value={value}
                        onClick={() =>
                          onOpenDetail(row.specialty, kind, row.threshold)
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
          {sorted.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell sx={{ ...stickyCell, fontWeight: 700 }}>Разом</TableCell>
                <TableCell align="center">—</TableCell>
                {(
                  [
                    'persons',
                    'above',
                    'below',
                    'budget',
                    'contractOnly',
                    'claimsBudgetBelow130',
                    'college',
                    'apps',
                    'cancelledByApplicant',
                    'cancelledPriority',
                    'duplicateCodes',
                  ] as const
                ).map((key) => (
                  <TableCell key={key} align="right" sx={{ fontWeight: 700 }}>
                    {sum(rows, key)}
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    </CollapsibleSection>
  )
}
