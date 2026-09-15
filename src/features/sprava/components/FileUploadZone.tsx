import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useId, useRef, useState } from 'react'

type Props = {
  fileName: string | null
  disabled?: boolean
  onFileSelected: (file: File) => void
}

export function FileUploadZone({
  fileName,
  disabled = false,
  onFileSelected,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const labelId = useId()
  const hintId = useId()

  const handleFiles = (files: FileList | null) => {
    if (disabled) return
    const file = files?.[0]
    if (!file) return
    onFileSelected(file)
  }

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  return (
    <Box
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-labelledby={labelId}
      aria-describedby={hintId}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if (disabled) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openPicker()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={openPicker}
      sx={{
        border: '2px dashed',
        borderColor: dragOver ? 'primary.main' : 'divider',
        bgcolor: dragOver ? 'rgba(42,122,58,0.06)' : 'background.paper',
        borderRadius: 2,
        px: 3,
        py: 5,
        textAlign: 'center',
        cursor: disabled ? 'wait' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        mb: 2.5,
        transition: 'border-color .15s, background .15s',
        outline: 'none',
        '&:focus-visible': {
          borderColor: 'primary.main',
          boxShadow: (t) => `0 0 0 3px ${t.palette.primary.main}33`,
        },
      }}
    >
      <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
        <CloudUploadOutlinedIcon color="primary" sx={{ fontSize: 48 }} aria-hidden />
        <Typography id={labelId} color="text.secondary">
          {fileName
            ? `Обрано: ${fileName}`
            : 'Перетягни сюди файл з ЄДЕБО (.xlsx / .xls / .csv)'}
        </Typography>
        <Typography id={hintId} variant="caption" color="text.secondary">
          Enter або пробіл — відкрити вибір файлу
        </Typography>
        <Button
          variant="contained"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            openPicker()
          }}
        >
          Вибрати файл
        </Button>
      </Stack>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,text/csv"
        hidden
        disabled={disabled}
        aria-label="Файл ЄДЕБО"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </Box>
  )
}
