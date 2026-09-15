import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { useEffect, useRef } from 'react'
import { printFormsHtml } from '../lib/printForms'

type Props = {
  open: boolean
  title: string
  html: string
  onClose: () => void
}

export function FormPreviewDialog({ open, title, html, onClose }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const root = bodyRef.current
    if (!root) return
    root.querySelectorAll<HTMLElement>('.form-page').forEach((page) => {
      page.contentEditable = 'true'
      page.style.outline = 'none'
    })
  }, [open, html])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Alert severity="info" className="sprava-no-print" sx={{ m: 2, mb: 0 }}>
          Клікни на будь-яке поле у формі, щоб відредагувати перед друком.
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
