import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import type { EncodingOption } from '../lib/types'

type Props = {
  encoding: EncodingOption
  printMode: 'mono' | 'color'
  faculty: string
  facultyOptions: string[]
  fileName: string | null
  status: string
  statusTone: 'muted' | 'ok' | 'err'
  hasData: boolean
  loading: boolean
  onEncodingChange: (value: EncodingOption) => void
  onPrintModeChange: (value: 'mono' | 'color') => void
  onFacultyChange: (value: string) => void
  onFileSelected: (file: File) => void
  onPrintPdf: () => void
}

export function StatystykaControls({
  encoding,
  printMode,
  faculty,
  facultyOptions,
  fileName,
  status,
  statusTone,
  hasData,
  loading,
  onEncodingChange,
  onPrintModeChange,
  onFacultyChange,
  onFileSelected,
  onPrintPdf,
}: Props) {
  const statusColor =
    statusTone === 'ok'
      ? 'success.main'
      : statusTone === 'err'
        ? 'error.main'
        : 'text.secondary'

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }} className="screen-only">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        useFlexGap
        sx={{ alignItems: { md: 'flex-end' }, flexWrap: 'wrap' }}
      >
        <Button variant="outlined" component="label" disabled={loading}>
          {loading ? 'Завантаження…' : 'CSV-файл'}
          <input
            hidden
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFileSelected(file)
              e.target.value = ''
            }}
          />
        </Button>

        <FormControl size="small" sx={{ minWidth: 180 }} disabled={loading}>
          <InputLabel>Кодування</InputLabel>
          <Select
            label="Кодування"
            value={encoding}
            onChange={(e) =>
              onEncodingChange(e.target.value as EncodingOption)
            }
          >
            <MenuItem value="auto">Автовизначення</MenuItem>
            <MenuItem value="windows-1251">Windows-1251</MenuItem>
            <MenuItem value="utf-8">UTF-8</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{ minWidth: 260 }}
          disabled={!hasData || loading}
        >
          <InputLabel>Факультет</InputLabel>
          <Select
            label="Факультет"
            value={faculty}
            onChange={(e) => onFacultyChange(e.target.value)}
          >
            {!facultyOptions.length && (
              <MenuItem value="">Спочатку завантажте файл</MenuItem>
            )}
            {facultyOptions.map((f) => (
              <MenuItem key={f} value={f}>
                {f}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel>Вигляд документа</InputLabel>
          <Select
            label="Вигляд документа"
            value={printMode}
            onChange={(e) =>
              onPrintModeChange(e.target.value as 'mono' | 'color')
            }
          >
            <MenuItem value="mono">Для чорно-білого принтера</MenuItem>
            <MenuItem value="color">Кольоровий звіт — як на екрані</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" disabled={!hasData} onClick={onPrintPdf}>
          Сформувати PDF
        </Button>
      </Stack>

      <Typography variant="body2" sx={{ mt: 1.5, color: statusColor }}>
        {fileName ? `Файл: ${fileName}. ` : ''}
        {status}
      </Typography>

      <Alert severity="info" sx={{ mt: 1.5 }}>
        <strong>Захист персональних даних.</strong> Файл і всі персональні дані
        обробляються локально у вашому браузері та нікуди не надсилаються.
      </Alert>
    </Paper>
  )
}
