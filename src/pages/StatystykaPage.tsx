import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material'
import { lazy, Suspense, useEffect } from 'react'
import { CategoryApplicantsSection } from '../features/statystyka/components/CategoryApplicantsSection'
import { CategoryReferenceSection } from '../features/statystyka/components/CategoryReferenceSection'
import { DetailPanel } from '../features/statystyka/components/DetailPanel'
import { DuplicatesSection } from '../features/statystyka/components/DuplicatesSection'
import { PrintReportHeader } from '../features/statystyka/components/PrintReportHeader'
import { PriorityChartSection } from '../features/statystyka/components/PriorityChartSection'
import { PriorityDetailPanel } from '../features/statystyka/components/PriorityDetailPanel'
import { SectionNav } from '../features/statystyka/components/SectionNav'
import { SpecialtySummarySection } from '../features/statystyka/components/SpecialtySummarySection'
import { StatsCards } from '../features/statystyka/components/StatsCards'
import { StatystykaControls } from '../features/statystyka/components/StatystykaControls'
import { useStatystyka } from '../features/statystyka/hooks/useStatystyka'
import {
  detailKindLabel,
  downloadCsv,
  downloadReportZip,
  yesNo,
} from '../features/statystyka/lib/export'

const SummaryChartsSection = lazy(() =>
  import('../features/statystyka/components/SummaryChartsSection').then(
    (m) => ({ default: m.SummaryChartsSection }),
  ),
)

export function StatystykaPage() {
  const s = useStatystyka()

  useEffect(() => {
    document.body.classList.toggle('print-mode-mono', s.printMode === 'mono')
    document.body.classList.toggle('print-mode-color', s.printMode === 'color')
    return () => {
      document.body.classList.remove('print-mode-mono', 'print-mode-color')
    }
  }, [s.printMode])

  const openDetail = (
    specialty: string,
    kind: Parameters<typeof s.openDetail>[1],
    threshold: number,
  ) => {
    void s.openDetail(
      specialty,
      kind,
      threshold,
      detailKindLabel(kind, threshold),
    )
  }

  const summaryCsvRows = [
    [
      'Спеціальність',
      'Поріг',
      'Вступників',
      'Бал ≥ порогу',
      'Бал < порогу',
      'Бюджет ≥130',
      'Контракт <130',
      'Бюджет але <130',
      'Коледж',
      'Чинних заяв',
      'Скасовано вступником',
      'Скасовано (втрата пріор.)',
      'Дубльованих шифрів',
    ],
    ...s.summary.map((r) => [
      r.specialty,
      r.threshold,
      r.persons,
      r.above,
      r.below,
      r.budget,
      r.contractOnly,
      r.claimsBudgetBelow130,
      r.college,
      r.apps,
      r.cancelledByApplicant,
      r.cancelledPriority,
      r.duplicateCodes,
    ]),
  ]

  const duplicatesCsvRows = [
    [
      'Спеціальність',
      'Шифр',
      'Ід заявки',
      'Ід персони',
      'Вступник',
      'Статус',
      'Бюджет',
      'Контракт',
      'Бал',
      'Дата',
    ],
    ...s.duplicates.map((r) => [
      r.specialty,
      r.caseCode,
      r.appId,
      r.personId,
      r.personName,
      r.status,
      yesNo(r.claimsBudget),
      yesNo(r.claimsContract),
      r.score ?? '',
      r.dateText,
    ]),
  ]

  const categoriesCsvRows = [
    [
      'Код',
      'Вступник',
      'Ід персони',
      'Макс. бал',
      'Телефон',
      'Email',
      'Заяви',
    ],
    ...s.categories.flatMap((g) =>
      g.applicants.map((p) => [
        g.code,
        p.personName,
        p.personId,
        p.maxScore ?? '',
        p.phone,
        p.email,
        p.applications
          .map((a) => `${a.specialty} (${a.score ?? '—'})`)
          .join('; '),
      ]),
    ),
  ]

  return (
    <Box className="statystyka-page">
      <Typography variant="h4" gutterBottom className="screen-only">
        Статистика вступників за спеціальностями
      </Typography>

      <StatystykaControls
        encoding={s.encoding}
        printMode={s.printMode}
        faculty={s.faculty}
        facultyOptions={s.faculties}
        fileName={s.fileName}
        status={s.status}
        statusTone={s.statusTone}
        hasData={s.hasData}
        loading={s.loading}
        onEncodingChange={s.setEncoding}
        onPrintModeChange={s.setPrintMode}
        onFacultyChange={s.changeFaculty}
        onFileSelected={s.loadFile}
        onPrintPdf={() => window.print()}
        onCollapseAll={() => s.setAllSections(false)}
        onExpandAll={() => s.setAllSections(true)}
        onExportZip={() => {
          void downloadReportZip(
            `statystyka-${s.faculty.replace(/[\\/:*?"<>|]+/g, '_')}.zip`,
            [
              { name: 'pidsumok.csv', rows: summaryCsvRows },
              { name: 'dublikaty.csv', rows: duplicatesCsvRows },
              { name: 'pilhy.csv', rows: categoriesCsvRows },
            ],
          )
        }}
        onClearSavedData={() => {
          void s.clearSavedData()
        }}
        cacheExpiresAt={s.cacheExpiresAt}
      />

      {s.hasData && (
        <>
          <PrintReportHeader
            faculty={s.faculty}
            fileName={s.fileName}
            printMode={s.printMode}
          />

          <SectionNav />

          <Box id="stat-summary" sx={{ scrollMarginTop: 72 }}>
            <StatsCards stats={s.totals} />
          </Box>

          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            }
          >
            <SummaryChartsSection
              faculty={s.faculty}
              specialties={s.summary}
              expanded={s.sections.charts}
              onExpandedChange={(v) => s.setSection('charts', v)}
              onOpenDetail={openDetail}
            />
          </Suspense>

          <SpecialtySummarySection
            rows={s.summary}
            expanded={s.sections.table}
            onExpandedChange={(v) => s.setSection('table', v)}
            onThresholdChange={s.changeThreshold}
            onOpenDetail={openDetail}
            onExport={() =>
              downloadCsv('statystyka-vstupnykiv.csv', summaryCsvRows)
            }
          />

          <PriorityChartSection
            faculty={s.faculty}
            specialties={s.summary}
            expanded={s.sections.priorities}
            onExpandedChange={(v) => s.setSection('priorities', v)}
            onOpenPriority={(specialty, priority) => {
              void s.openPriorityDetail(specialty, priority)
            }}
          />

          <PriorityDetailPanel
            detail={s.priorityDetail}
            onClose={s.closePriorityDetail}
            onExport={() => {
              if (!s.priorityDetail) return
              downloadCsv(
                `priority-${s.priorityDetail.priority}-${s.priorityDetail.specialty.replace(/[\\/:*?"<>|]+/g, '_')}.csv`,
                [
                  [
                    '№',
                    'Вступник',
                    'Ід персони',
                    'Бал',
                    'Бюджет',
                    'Контракт',
                    'Шифри',
                    'Ід заявок',
                    'Статуси',
                    'Телефон',
                    'Email',
                    'Дата',
                  ],
                  ...s.priorityDetail.rows.map((r, i) => [
                    i + 1,
                    r.personName,
                    r.personId,
                    r.score ?? '',
                    yesNo(r.claimsBudget),
                    yesNo(r.claimsContract),
                    r.caseCodes.join(', '),
                    r.appIds.join(', '),
                    r.statuses.join(', '),
                    r.phone,
                    r.email,
                    r.dateText,
                  ]),
                ],
              )
            }}
          />

          <DetailPanel
            detail={s.detail}
            onClose={s.closeDetail}
            onExport={() => {
              if (!s.detail) return
              downloadCsv(
                `vstupnyky-${s.detail.specialty.replace(/[\\/:*?"<>|]+/g, '_')}.csv`,
                [
                  [
                    'Вступник',
                    'Телефон',
                    'Email',
                    'Ід персони',
                    'Ід заявки',
                    'Статус',
                    'Бюджет',
                    'Контракт',
                    'Бал',
                    'Шифр',
                    'Дата',
                  ],
                  ...s.detail.rows.map((r) => [
                    r.personName,
                    r.phone,
                    r.email,
                    r.personId,
                    r.appId,
                    r.status,
                    yesNo(r.claimsBudget),
                    yesNo(r.claimsContract),
                    r.appScore ?? '',
                    r.caseCode,
                    r.dateText,
                  ]),
                ],
              )
            }}
          />

          <CategoryApplicantsSection
            groups={s.categories}
            expanded={s.sections.categories}
            onExpandedChange={(v) => s.setSection('categories', v)}
          />
          <CategoryReferenceSection />

          <DuplicatesSection
            rows={s.duplicates}
            expanded={s.sections.duplicates}
            onExpandedChange={(v) => s.setSection('duplicates', v)}
            onExport={() =>
              downloadCsv('dublikaty-shyfriv.csv', duplicatesCsvRows)
            }
          />
        </>
      )}
    </Box>
  )
}
