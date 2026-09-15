import { Box, Button, Stack } from '@mui/material'
import { useEffect, useRef } from 'react'
import { printFormsHtml } from '../lib/printForms'

type Props = {
  html: string
  onBack: () => void
}

export function FormsBatchView({ html, onBack }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    root.querySelectorAll<HTMLElement>('.form-page').forEach((page) => {
      page.contentEditable = 'true'
      page.style.outline = 'none'
    })
  }, [html])

  return (
    <Box className="sprava-batch-view">
      <Stack
        direction="row"
        spacing={1}
        className="sprava-batch-toolbar sprava-no-print"
      >
        <Button variant="outlined" onClick={onBack}>
          ← Назад до списку
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            const live = rootRef.current?.innerHTML ?? html
            printFormsHtml(live, 'Пакет форм')
          }}
        >
          Друкувати
        </Button>
      </Stack>
      <Box ref={rootRef} dangerouslySetInnerHTML={{ __html: html }} />
    </Box>
  )
}
