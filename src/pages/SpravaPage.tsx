import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { useState } from 'react'
import { ApplicantsPreview } from '../features/sprava/components/ApplicantsPreview'
import { FileUploadZone } from '../features/sprava/components/FileUploadZone'
import { FormPreviewDialog } from '../features/sprava/components/FormPreviewDialog'
import { FormsBatchView } from '../features/sprava/components/FormsBatchView'
import { OrderConfigDialog } from '../features/sprava/components/OrderConfigDialog'
import { SpravaHelp } from '../features/sprava/components/SpravaHelp'
import { SpravaSettingsCard } from '../features/sprava/components/SpravaSettingsCard'
import { useSprava } from '../features/sprava/hooks/useSprava'
import { g, parseName } from '../features/sprava/lib/helpers'
import { COL, type OrderConfigRow } from '../features/sprava/types'
import '../features/sprava/forms.css'

export function SpravaPage() {
  const s = useSprava()
  const [orderOpen, setOrderOpen] = useState(false)
  const [orderDraft, setOrderDraft] = useState<OrderConfigRow[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTitle, setPreviewTitle] = useState('Попередній перегляд')
  const [previewHtml, setPreviewHtml] = useState('')
  const [batchHtml, setBatchHtml] = useState<string | null>(null)

  if (batchHtml) {
    return (
      <FormsBatchView html={batchHtml} onBack={() => setBatchHtml(null)} />
    )
  }

  return (
    <Box className="sprava-page">
      <Typography variant="h4" color="primary" gutterBottom>
        Особові справи вступників
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Генератор форм Н-2.01 та Н-1.03.1 · НУБіП України
      </Typography>

      <SpravaHelp orderConfig={s.orderConfig} />

      <SpravaSettingsCard
        settings={s.settings}
        onChange={s.setSettings}
        onOpenOrderConfig={() => {
          setOrderDraft(s.orderConfig.map((r) => ({ ...r })))
          setOrderOpen(true)
        }}
      />

      <FileUploadZone
        fileName={s.fileName}
        disabled={s.loading}
        onFileSelected={(file) => {
          void s.loadFile(file)
        }}
      />

      {s.loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <CircularProgress size={22} />
          <Typography color="text.secondary">Обробка Excel…</Typography>
        </Box>
      )}

      {s.status && (
        <Alert
          severity={
            s.statusTone === 'err'
              ? 'error'
              : s.statusTone === 'ok'
                ? 'success'
                : 'info'
          }
          sx={{ mb: 2 }}
        >
          {s.status}
        </Alert>
      )}

      {s.fileName && (
        <ApplicantsPreview
          filters={s.filters}
          onFiltersChange={s.setFilters}
          facultyOptions={s.facultyOptions}
          specialtyOptions={s.specialtyOptions}
          formOptions={s.formOptions}
          rows={s.filteredRows}
          totalLoaded={s.totalLoaded}
          onReset={s.reset}
          onGenerate={() => {
            if (!s.filteredRecords.length) return
            setBatchHtml(s.buildFormsHtml())
            window.scrollTo(0, 0)
          }}
          onPreview={(id) => {
            const rec = s.findRecord(id)
            if (!rec) return
            const nm = parseName(g(rec.raw, COL.pib))
            setPreviewTitle(
              `${[nm.last, nm.first, nm.mid].filter(Boolean).join(' ')} — ${g(rec.raw, COL.fileNum)}`,
            )
            setPreviewHtml(s.buildFormsHtml([id]))
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
          s.setOrderConfig(orderDraft)
          setOrderOpen(false)
        }}
      />

      <FormPreviewDialog
        open={previewOpen}
        title={previewTitle}
        html={previewHtml}
        onClose={() => setPreviewOpen(false)}
      />
    </Box>
  )
}
