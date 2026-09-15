import { Typography } from '@mui/material'
import { CategoryApplicantsSection } from '../features/statystyka/components/CategoryApplicantsSection'
import { CategoryReferenceSection } from '../features/statystyka/components/CategoryReferenceSection'
import { DetailPanel } from '../features/statystyka/components/DetailPanel'
import { DuplicatesSection } from '../features/statystyka/components/DuplicatesSection'
import { PriorityChartSection } from '../features/statystyka/components/PriorityChartSection'
import { PriorityDetailPanel } from '../features/statystyka/components/PriorityDetailPanel'
import { SpecialtySummarySection } from '../features/statystyka/components/SpecialtySummarySection'
import { StatsCards } from '../features/statystyka/components/StatsCards'
import { SummaryChartsSection } from '../features/statystyka/components/SummaryChartsSection'
import { StatystykaControls } from '../features/statystyka/components/StatystykaControls'
import { useStatystyka } from '../features/statystyka/hooks/useStatystyka'
import {
  detailKindLabel,
  downloadCsv,
  yesNo,
} from '../features/statystyka/lib/export'

export function StatystykaPage() {
  const s = useStatystyka()

  return (
    <>
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
      />

      {s.hasData && (
        <>
          <StatsCards stats={s.totals} />

          <SummaryChartsSection faculty={s.faculty} specialties={s.summary} />

          <SpecialtySummarySection
            rows={s.summary}
            onThresholdChange={s.changeThreshold}
            onOpenDetail={(specialty, kind, threshold) =>
              s.openDetail(
                specialty,
                kind,
                threshold,
                detailKindLabel(kind, threshold),
              )
            }
            onExport={() =>
              downloadCsv('statystyka-vstupnykiv.csv', [
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
              ])
            }
          />

          <PriorityChartSection
            faculty={s.faculty}
            specialties={s.summary}
            onOpenPriority={s.openPriorityDetail}
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

          <CategoryApplicantsSection groups={s.categories} />
          <CategoryReferenceSection />

          <DuplicatesSection
            rows={s.duplicates}
            onExport={() =>
              downloadCsv('dublikaty-shyfriv.csv', [
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
              ])
            }
          />
        </>
      )}
    </>
  )
}
