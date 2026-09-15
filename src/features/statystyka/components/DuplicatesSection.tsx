import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Fragment, useMemo } from 'react'
import { yesNo } from '../lib/export'
import type { DuplicateRow } from '../lib/types'

type Props = {
  rows: DuplicateRow[]
  onExport: () => void
}

type Group = {
  key: string
  specialty: string
  caseCode: string
  rows: DuplicateRow[]
}

export function DuplicatesSection({ rows, onExport }: Props) {
  const groups = useMemo(() => {
    const map = new Map<string, Group>()
    for (const row of rows) {
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
  }, [rows])

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{
          mb: 1.5,
          justifyContent: 'space-between',
          alignItems: { sm: 'center' },
        }}
      >
        <Typography variant="h6">
          Дублікати «Номер (шифр) особової справи»
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={onExport}
          disabled={rows.length === 0}
        >
          Експорт дублікатів CSV
        </Button>
      </Stack>

      {rows.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Дублікатів у вибраному факультеті немає.
        </Typography>
      ) : (
        <TableContainer
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Спеціальність</TableCell>
                <TableCell>Шифр</TableCell>
                <TableCell>Ід заявки</TableCell>
                <TableCell>Ід персони</TableCell>
                <TableCell>Вступник</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Бюджет</TableCell>
                <TableCell>Контракт</TableCell>
                <TableCell align="right">Бал</TableCell>
                <TableCell>Дата</TableCell>
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
                        <TableCell>{row.specialty}</TableCell>
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
                  Разом груп дублікатів: {groups.length}; заяв у групах:{' '}
                  {rows.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
}
