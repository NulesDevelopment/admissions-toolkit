import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import type { ApplicantFilters, ApplicantRow } from '../types'

type Props = {
  filters: ApplicantFilters
  onFiltersChange: (next: ApplicantFilters) => void
  facultyOptions: string[]
  specialtyOptions: string[]
  formOptions: string[]
  rows: ApplicantRow[]
  totalLoaded: number
  onReset: () => void
  onGenerate: () => void
  onPreview: (id: string) => void
}

export function ApplicantsPreview({
  filters,
  onFiltersChange,
  facultyOptions,
  specialtyOptions,
  formOptions,
  rows,
  totalLoaded,
  onReset,
  onGenerate,
  onPreview,
}: Props) {
  const needsSpecialty = !filters.specialty

  const set = (key: keyof ApplicantFilters) => (value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    } as ApplicantFilters)
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2.5,
      }}
    >
      <Stack
        direction="row"
        sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="h6">Вступники</Typography>
        <Chip
          label={`${rows.length} / ${totalLoaded}`}
          color="primary"
          size="small"
        />
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1.5 }}
      >
        <TextField
          label="Пошук (ПІБ)"
          size="small"
          fullWidth
          value={filters.search}
          onChange={(e) => set('search')(e.target.value)}
        />
        <FormControl size="small" fullWidth>
          <InputLabel>Факультет</InputLabel>
          <Select
            label="Факультет"
            value={filters.faculty}
            onChange={(e) => set('faculty')(e.target.value)}
          >
            <MenuItem value="">Усі</MenuItem>
            {facultyOptions.map((o) => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Спеціальність</InputLabel>
          <Select
            label="Спеціальність"
            value={filters.specialty}
            onChange={(e) => set('specialty')(e.target.value)}
          >
            <MenuItem value="">Оберіть спеціальність</MenuItem>
            {specialtyOptions.map((o) => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Форма</InputLabel>
          <Select
            label="Форма"
            value={filters.form}
            onChange={(e) => set('form')(e.target.value)}
          >
            <MenuItem value="">Усі</MenuItem>
            {formOptions.map((o) => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Фінансування</InputLabel>
          <Select
            label="Фінансування"
            value={filters.funding}
            onChange={(e) => set('funding')(e.target.value)}
          >
            <MenuItem value="">Усі</MenuItem>
            <MenuItem value="budget">Бюджет</MenuItem>
            <MenuItem value="contract">Контракт</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <TableContainer
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          mb: 2,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ПІБ</TableCell>
              <TableCell>Факультет</TableCell>
              <TableCell>Спеціальність</TableCell>
              <TableCell>Форма</TableCell>
              <TableCell>Фінансування</TableCell>
              <TableCell align="right">Дія</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {needsSpecialty ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 4, color: 'text.secondary' }}
                >
                  Оберіть спеціальність вище, щоб побачити список вступників.
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 4, color: 'text.secondary' }}
                >
                  Нічого не знайдено за поточними фільтрами.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.fullName}</TableCell>
                  <TableCell>{row.faculty}</TableCell>
                  <TableCell>{row.specialty}</TableCell>
                  <TableCell>{row.form}</TableCell>
                  <TableCell>
                    {row.funding === 'budget' ? 'Бюджет' : 'Контракт'}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => onPreview(row.id)}>
                      Переглянути
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ justifyContent: 'flex-end' }}
      >
        <Button variant="outlined" onClick={onReset}>
          Новий файл
        </Button>
        <Button
          variant="contained"
          size="large"
          disabled={rows.length === 0}
          onClick={onGenerate}
        >
          Згенерувати форми ({rows.length})
        </Button>
      </Stack>
    </Box>
  )
}
