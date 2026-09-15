import { Alert, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { ApplicantsPreview } from '../features/sprava/components/ApplicantsPreview'
import { FileUploadZone } from '../features/sprava/components/FileUploadZone'
import { FormPreviewDialog } from '../features/sprava/components/FormPreviewDialog'
import { OrderConfigDialog } from '../features/sprava/components/OrderConfigDialog'
import { SpravaHelp } from '../features/sprava/components/SpravaHelp'
import { SpravaSettingsCard } from '../features/sprava/components/SpravaSettingsCard'
import {
  defaultFilters,
  defaultSpravaSettings,
  type ApplicantFilters,
  type ApplicantRow,
  type OrderConfigRow,
  type SpravaSettings,
} from '../features/sprava/types'

export function SpravaPage() {
  const [settings, setSettings] = useState<SpravaSettings>(defaultSpravaSettings)
  const [filters, setFilters] = useState<ApplicantFilters>(defaultFilters)
  const [fileName, setFileName] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [rows, setRows] = useState<ApplicantRow[]>([])
  const [orderOpen, setOrderOpen] = useState(false)
  const [orderDraft, setOrderDraft] = useState<OrderConfigRow[]>([
    { id: '1', date: '01.08.2026', orderNumbers: '1255' },
  ])
  const [orderSaved, setOrderSaved] = useState<OrderConfigRow[]>(orderDraft)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTitle, setPreviewTitle] = useState('Попередній перегляд')

  const facultyOptions = useMemo(
    () => [...new Set(rows.map((r) => r.faculty))].sort(),
    [rows],
  )
  const specialtyOptions = useMemo(
    () => [...new Set(rows.map((r) => r.specialty))].sort(),
    [rows],
  )
  const formOptions = useMemo(
    () => [...new Set(rows.map((r) => r.form))].sort(),
    [rows],
  )

  const filteredRows = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return rows.filter((row) => {
      if (q && !row.fullName.toLowerCase().includes(q)) return false
      if (filters.faculty && row.faculty !== filters.faculty) return false
      if (filters.specialty && row.specialty !== filters.specialty) return false
      if (filters.form && row.form !== filters.form) return false
      if (filters.funding && row.funding !== filters.funding) return false
      return true
    })
  }, [rows, filters])

  return (
    <>
      <Typography variant="h4" color="primary" gutterBottom>
        Особові справи вступників
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Генератор форм Н-2.01 та Н-1.03.1 · НУБіП України
      </Typography>

      <SpravaHelp />

      <SpravaSettingsCard
        settings={settings}
        onChange={setSettings}
        onOpenOrderConfig={() => {
          setOrderDraft(orderSaved)
          setOrderOpen(true)
        }}
      />

      <FileUploadZone
        fileName={fileName}
        onFileSelected={(file) => {
          setFileName(file.name)
          setRows([])
          setFilters(defaultFilters)
          setStatus(
            `Файл «${file.name}» прийнято. Парсинг Excel і фільтр «До наказу» буде підключено наступним кроком.`,
          )
        }}
      />

      {status && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {status}
        </Alert>
      )}

      {fileName && (
        <ApplicantsPreview
          filters={filters}
          onFiltersChange={setFilters}
          facultyOptions={facultyOptions}
          specialtyOptions={specialtyOptions}
          formOptions={formOptions}
          rows={filteredRows}
          onReset={() => {
            setFileName(null)
            setRows([])
            setFilters(defaultFilters)
            setStatus(null)
          }}
          onGenerate={() =>
            setStatus(
              'Генерація пакету форм буде перенесена з HTML-прототипу.',
            )
          }
          onPreview={(id) => {
            const row = rows.find((r) => r.id === id)
            setPreviewTitle(row?.fullName ?? 'Попередній перегляд')
            setPreviewOpen(true)
          }}
        />
      )}

      <OrderConfigDialog
        open={orderOpen}
        rows={orderDraft}
        onClose={() => setOrderOpen(false)}
        onChange={setOrderDraft}
        onSave={() => {
          setOrderSaved(orderDraft)
          setOrderOpen(false)
        }}
      />

      <FormPreviewDialog
        open={previewOpen}
        title={previewTitle}
        onClose={() => setPreviewOpen(false)}
        onPrint={() => window.print()}
      />
    </>
  )
}
