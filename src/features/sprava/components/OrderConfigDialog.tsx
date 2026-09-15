import AddIcon from '@mui/icons-material/Add'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import type { OrderConfigRow } from '../types'

type Props = {
  open: boolean
  rows: OrderConfigRow[]
  onClose: () => void
  onChange: (rows: OrderConfigRow[]) => void
  onSave: () => void
}

export function OrderConfigDialog({
  open,
  rows,
  onClose,
  onChange,
  onSave,
}: Props) {
  const updateRow = (id: string, patch: Partial<OrderConfigRow>) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Конфіг дат наказів</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Кожен рядок — одна дата і список номерів наказів через кому. При
          генерації форми номер наказу шукається тут і автоматично береться
          відповідна дата.
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={160}>Дата наказу</TableCell>
              <TableCell>Номери наказів</TableCell>
              <TableCell width={48} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="ДД.ММ.РРРР"
                    value={row.date}
                    onChange={(e) => updateRow(row.id, { date: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="1255, 1256, 1257"
                    value={row.orderNumbers}
                    onChange={(e) =>
                      updateRow(row.id, { orderNumbers: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    aria-label="Видалити"
                    onClick={() => onChange(rows.filter((r) => r.id !== row.id))}
                  >
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          startIcon={<AddIcon />}
          sx={{ mt: 1.5 }}
          onClick={() =>
            onChange([
              ...rows,
              {
                id: crypto.randomUUID(),
                date: '',
                orderNumbers: '',
              },
            ])
          }
        >
          Додати дату
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Скасувати</Button>
        <Button variant="contained" onClick={onSave}>
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  )
}
