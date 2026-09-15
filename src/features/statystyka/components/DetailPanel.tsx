import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { yesNo } from '../lib/export'
import type { PublicAppRecord } from '../lib/types'
import type { DetailState } from '../hooks/useStatystyka'

type Props = {
  detail: DetailState
  onClose: () => void
  onExport: () => void
}

export function DetailPanel({ detail, onClose, onExport }: Props) {
  if (!detail) return null

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{
          mb: 1.5,
          justifyContent: 'space-between',
          alignItems: { sm: 'flex-start' },
        }}
      >
        <div>
          <Typography variant="h6">
            {detail.specialty} — {detail.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Вступників: {detail.persons}; записів: {detail.apps}
          </Typography>
        </div>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={onExport}>
            Експорт CSV
          </Button>
          <Button size="small" onClick={onClose}>
            Закрити
          </Button>
        </Stack>
      </Stack>

      <TableContainer
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
              <TableCell>Вступник</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Ід персони</TableCell>
              <TableCell>Ід заявки</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Бюджет</TableCell>
              <TableCell>Контракт</TableCell>
              <TableCell align="right">Бал</TableCell>
              <TableCell>Шифр</TableCell>
              <TableCell>Дата</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detail.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                  Немає записів.
                </TableCell>
              </TableRow>
            ) : (
              detail.rows.map((row: PublicAppRecord, i) => (
                <TableRow key={`${row.appId}-${i}`} hover>
                  <TableCell>{row.personName}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.personId}</TableCell>
                  <TableCell>{row.appId}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{yesNo(row.claimsBudget)}</TableCell>
                  <TableCell>{yesNo(row.claimsContract)}</TableCell>
                  <TableCell align="right">
                    {row.appScore ?? '—'}
                  </TableCell>
                  <TableCell>{row.caseCode}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {row.dateText}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
