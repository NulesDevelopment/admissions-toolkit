import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import {
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import type { SpravaSettings } from '../types'

type Props = {
  settings: SpravaSettings
  onChange: (next: SpravaSettings) => void
  onOpenOrderConfig: () => void
}

export function SpravaSettingsCard({
  settings,
  onChange,
  onOpenOrderConfig,
}: Props) {
  const set =
    (key: keyof SpravaSettings) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange({ ...settings, [key]: event.target.value })
    }

  return (
    <Card variant="outlined" sx={{ mb: 2.5 }}>
      <CardContent>
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2, alignItems: 'center' }}
        >
          <SettingsOutlinedIcon fontSize="small" color="action" />
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700 }}
          >
            Налаштування
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Термін навчання"
              fullWidth
              size="small"
              value={settings.duration}
              onChange={set('duration')}
              placeholder="напр.: 3 р. 10 міс"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Рік вступу"
              fullWidth
              size="small"
              value={settings.year}
              onChange={set('year')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onOpenOrderConfig}
              sx={{ height: 40 }}
            >
              Дати наказів…
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Відповідальний секретар"
              fullWidth
              size="small"
              value={settings.secretary}
              onChange={set('secretary')}
              placeholder="Прізвище ІМ'Я"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Назва університету"
              fullWidth
              size="small"
              value={settings.university}
              onChange={set('university')}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
