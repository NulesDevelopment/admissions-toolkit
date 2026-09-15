import { Card, CardContent, Grid, Typography } from '@mui/material'
import type { SummaryTotals } from '../lib/types'

type Props = {
  stats: SummaryTotals
}

const items: { key: keyof SummaryTotals; label: string }[] = [
  { key: 'specialties', label: 'Спеціальностей' },
  { key: 'persons', label: 'Вступників*' },
  { key: 'apps', label: 'Чинних заяв' },
  { key: 'duplicateCodes', label: 'Дубльованих шифрів' },
]

export function StatsCards({ stats }: Props) {
  return (
    <>
      <Grid container spacing={1.5} sx={{ mb: 1 }}>
        {items.map((item) => (
          <Grid key={item.key} size={{ xs: 6, md: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h5">{stats[item.key]}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 2 }}
      >
        * Сума унікальних «Ід персони» окремо по спеціальностях. Одна людина на
        двох спеціальностях враховується в обох.
      </Typography>
    </>
  )
}
