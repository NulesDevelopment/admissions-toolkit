import { Box, Typography } from '@mui/material'

type Props = {
  faculty: string
  fileName: string | null
  printMode: 'mono' | 'color'
}

export function PrintReportHeader({ faculty, fileName, printMode }: Props) {
  const generatedAt = new Date().toLocaleString('uk-UA')

  return (
    <Box className="print-only print-report-header" sx={{ mb: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Звіт зі статистики вступників
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>Факультет:</strong> {faculty}
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>Файл:</strong> {fileName ?? '—'}
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>Сформовано:</strong> {generatedAt}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Вигляд:</strong>{' '}
        {printMode === 'color'
          ? 'Кольоровий звіт — як на екрані'
          : 'Для чорно-білого принтера'}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p">
        Захист персональних даних. Файл і всі персональні дані обробляються
        локально у браузері.
      </Typography>
    </Box>
  )
}
