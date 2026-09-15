import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useRef, useState } from 'react'

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

  const handleFiles = (files: FileList | null) => {
    if (disabled) return
    const file = files?.[0]
    if (!file) return
    onFileSelected(file)
  }

  return (
    <Box
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
      onClick={() => {
        if (!disabled) inputRef.current?.click()
      }}
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
      }}
    >
      <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
        <CloudUploadOutlinedIcon color="primary" sx={{ fontSize: 48 }} />
        <Typography color="text.secondary">
          {fileName
            ? `Обрано: ${fileName}`
            : 'Перетягни сюди файл з ЄДЕБО (.xlsx / .xls / .csv)'}
        </Typography>
        <Button
          variant="contained"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
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
        onChange={(e) => handleFiles(e.target.files)}
      />
    </Box>
  )
}
