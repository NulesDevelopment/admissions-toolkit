import {
  Box,
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
  TextField,
  Typography,
} from '@mui/material'
import type { DetailKind, SpecialtySummary } from '../lib/types'

type Props = {
  rows: SpecialtySummary[]
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

export function SpecialtySummarySection({
  rows,
  onExport,
  onThresholdChange,
  onOpenDetail,
}: Props) {
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
        <Typography variant="h6">Показники по спеціальностях</Typography>
        <Button size="small" variant="outlined" onClick={onExport}>
          Експорт підсумку CSV
        </Button>
      </Stack>

      <TableContainer
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
              <TableCell>Спеціальність</TableCell>
              <TableCell align="center">Поріг</TableCell>
              <TableCell align="right">Вступників</TableCell>
              <TableCell align="right">≥ порогу</TableCell>
              <TableCell align="right">&lt; порогу</TableCell>
              <TableCell align="right">Бюджет ≥130</TableCell>
              <TableCell align="right">Контракт &lt;130</TableCell>
              <TableCell align="right">Бюджет, але &lt;130</TableCell>
              <TableCell align="right">Коледж</TableCell>
              <TableCell align="right">Чинних</TableCell>
              <TableCell align="right">Скас. вступн.</TableCell>
              <TableCell align="right">Втрата пріор.</TableCell>
              <TableCell align="right">Дублікати</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={13}
                  align="center"
                  sx={{ py: 4, color: 'text.secondary' }}
                >
                  Немає даних.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.specialty} hover>
                  <TableCell sx={{ minWidth: 180 }}>{row.specialty}</TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={row.threshold}
                      slotProps={{
                        htmlInput: { min: 101, max: 199, step: 1 },
                      }}
                      onChange={(e) =>
                        onThresholdChange(row.specialty, Number(e.target.value))
                      }
                      sx={{ width: 72 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <CountBtn
                      value={row.persons}
                      onClick={() =>
                        onOpenDetail(row.specialty, 'persons', row.threshold)
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <CountBtn
                      value={row.above}
                      onClick={() =>
                        onOpenDetail(row.specialty, 'above', row.threshold)
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <CountBtn
                      value={row.below}
                      onClick={() =>
                        onOpenDetail(row.specialty, 'below', row.threshold)
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <CountBtn
                      value={row.budget}
                      onClick={() =>
                        onOpenDetail(row.specialty, 'budget', row.threshold)
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <CountBtn
                      value={row.contractOnly}
                      onClick={() =>
                        onOpenDetail(
                          row.specialty,
                          'contractOnly',
                          row.threshold,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <CountBtn
                      value={row.claimsBudgetBelow130}
                      onClick={() =>
                        onOpenDetail(
                          row.specialty,
                          'claimsBudgetBelow130',
                          row.threshold,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <CountBtn
                      value={row.college}
                      onClick={() =>
                        onOpenDetail(row.specialty, 'college', row.threshold)
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <CountBtn
                      value={row.apps}
                      onClick={() =>
                        onOpenDetail(row.specialty, 'apps', row.threshold)
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <CountBtn
                      value={row.cancelledByApplicant}
                      onClick={() =>
                        onOpenDetail(
                          row.specialty,
                          'cancelledByApplicant',
                          row.threshold,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <CountBtn
                      value={row.cancelledPriority}
                      onClick={() =>
                        onOpenDetail(
                          row.specialty,
                          'cancelledPriority',
                          row.threshold,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <CountBtn
                      value={row.duplicateCodes}
                      onClick={() =>
                        onOpenDetail(row.specialty, 'duplicates', row.threshold)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {rows.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Разом</TableCell>
                <TableCell align="center">—</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {sum(rows, 'persons')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {sum(rows, 'above')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {sum(rows, 'below')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {sum(rows, 'budget')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {sum(rows, 'contractOnly')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {sum(rows, 'claimsBudgetBelow130')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {sum(rows, 'college')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {sum(rows, 'apps')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {sum(rows, 'cancelledByApplicant')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {sum(rows, 'cancelledPriority')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {sum(rows, 'duplicateCodes')}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>

      <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          Клікніть на число, щоб відкрити детальний список. Початковий поріг —
          145; бюджетна межа — 130 балів.
        </Typography>
      </Box>
    </Paper>
  )
}
