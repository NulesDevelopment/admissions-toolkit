import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { useFormHost } from '../hooks/useFormHost'
import { printFormsHtml } from '../lib/printForms'

type Props = {
  open: boolean
  title: string
  html: string
  onClose: () => void
}

export function FormPreviewDialog({ open, title, html, onClose }: Props) {
  const bodyRef = useFormHost(html, open)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      keepMounted
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Alert severity="info" className="sprava-no-print" sx={{ m: 2, mb: 0 }}>
          Клікни поле, щоб відредагувати текст. У рамці «фото» — завантаж
          зображення, перетягуй і масштабуй колесом / кнопками.
        </Alert>
        <Box
          ref={bodyRef}
          className="sprava-forms-preview"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </DialogContent>
      <DialogActions className="sprava-no-print">
        <Button onClick={onClose}>Закрити</Button>
        <Button
          variant="contained"
          onClick={() => {
            const live = bodyRef.current?.innerHTML ?? html
            printFormsHtml(live, title)
          }}
        >
          Роздрукувати цю заяву
        </Button>
      </DialogActions>
    </Dialog>
  )
}
