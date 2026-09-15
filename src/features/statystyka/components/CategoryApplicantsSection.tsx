import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import {
  categoryInfo,
  countUniqueCategoryApplicants,
} from '../lib/categoryReference'
import { yesNo } from '../lib/export'
import type { CategoryGroup } from '../lib/types'
import { CollapsibleSection } from './CollapsibleSection'

type Props = {
  groups: CategoryGroup[]
  expanded: boolean
  onExpandedChange: (v: boolean) => void
}

export function CategoryApplicantsSection({
  groups,
  expanded,
  onExpandedChange,
}: Props) {
  const uniqueCount = useMemo(
    () => countUniqueCategoryApplicants(groups),
    [groups],
  )

  return (
    <CollapsibleSection
      id="stat-categories"
      title="Вступники за кодами пільгових категорій"
      subtitle={`Унікальних вступників: ${uniqueCount}`}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      {groups.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          Немає вступників із пільговими категоріями у вибраному факультеті.
        </Typography>
      ) : (
        groups.map((group) => {
          const info = categoryInfo(group.code)
          return (
            <Accordion key={group.code} disableGutters elevation={0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>
                  {group.code} — {info.title} ({group.applicants.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1.5 }}
                >
                  {info.benefit}
                </Typography>
                <TableContainer
                  className="print-table"
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Вступник</TableCell>
                        <TableCell>Ід персони</TableCell>
                        <TableCell align="right">Макс. бал</TableCell>
                        <TableCell>Заяви</TableCell>
                        <TableCell>Телефон</TableCell>
                        <TableCell>Email</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.applicants.map((person, i) => (
                        <TableRow key={`${person.personId}-${i}`} hover>
                          <TableCell>{person.personName}</TableCell>
                          <TableCell>{person.personId}</TableCell>
                          <TableCell align="right">
                            {person.maxScore ?? '—'}
                          </TableCell>
                          <TableCell>
                            {person.applications
                              .map(
                                (a) =>
                                  `${a.specialty} (${a.score ?? '—'}; ${yesNo(a.claimsBudget)}/${yesNo(a.claimsContract)})`,
                              )
                              .join('; ')}
                          </TableCell>
                          <TableCell>{person.phone}</TableCell>
                          <TableCell>{person.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )
        })
      )}
    </CollapsibleSection>
  )
}
