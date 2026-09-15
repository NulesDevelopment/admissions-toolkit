import { Chip, Stack } from '@mui/material'

const links = [
  { href: '#stat-summary', label: 'Підсумок' },
  { href: '#stat-charts', label: 'Діаграми' },
  { href: '#stat-table', label: 'Таблиця' },
  { href: '#stat-priorities', label: 'Пріоритети' },
  { href: '#stat-categories', label: 'Пільги' },
  { href: '#stat-duplicates', label: 'Дублікати' },
] as const

export function SectionNav() {
  return (
    <Stack
      direction="row"
      useFlexGap
      spacing={1}
      className="screen-only"
      sx={{ mb: 2, flexWrap: 'wrap' }}
    >
      {links.map((link) => (
        <Chip
          key={link.href}
          component="a"
          href={link.href}
          clickable
          label={link.label}
          size="small"
          variant="outlined"
          color="primary"
        />
      ))}
    </Stack>
  )
}
