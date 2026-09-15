import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

type Props = {
  open: boolean
  title: string
  onClose: () => void
  onPrint: () => void
}

export function FormPreviewDialog({ open, title, onClose, onPrint }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Клікни на будь-яке поле у формі, щоб відредагувати перед друком.
        </Alert>
        <Typography color="text.secondary">
          Попередній перегляд форм Н-2.01 та Н-1.03.1 зʼявиться тут після
          перенесення логіки генерації з HTML-прототипу.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрити</Button>
        <Button variant="contained" onClick={onPrint}>
          Роздрукувати цю заяву
        </Button>
      </DialogActions>
    </Dialog>
  )
}
