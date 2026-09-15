import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import type { SpecialtySummary } from '../lib/types'

type Props = {
  faculty: string
  specialties: SpecialtySummary[]
  onOpenPriority: (specialty: string, priority: number) => void
}

export function PriorityChartSection({
  faculty,
  specialties,
  onOpenPriority,
}: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Пріоритети заяв за спеціальностями — {faculty}
      </Typography>

      {specialties.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          Немає даних.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {specialties.map((spec) => {
            const maxApplicants = Math.max(
              1,
              ...spec.priorities.map((p) => p.applicants),
            )
            return (
              <Box key={spec.specialty}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {spec.specialty}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: 'flex-end', minHeight: 96 }}
                >
                  {spec.priorities.map((p) => {
                    const height = Math.max(
                      4,
                      Math.round((p.applicants / maxApplicants) * 80),
                    )
                    return (
                      <Button
                        key={p.priority}
                        disabled={p.applicants === 0}
                        onClick={() =>
                          onOpenPriority(spec.specialty, p.priority)
                        }
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          px: 0.25,
                          py: 0.5,
                          flexDirection: 'column',
                          gap: 0.25,
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {p.applicants}
                        </Typography>
                        <Box
                          sx={{
                            width: '70%',
                            height,
                            bgcolor:
                              p.applicants === 0
                                ? 'action.disabledBackground'
                                : 'primary.main',
                            borderRadius: 0.5,
                          }}
                        />
                        <Typography variant="caption">П{p.priority}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: 10, lineHeight: 1.1 }}
                        >
                          Б{p.budget}/К{p.contract}
                        </Typography>
                      </Button>
                    )
                  })}
                </Stack>
              </Box>
            )
          })}
        </Stack>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
        У дужках: Б — претендують на бюджет; К — лише на контракт. Висота
        стовпця — унікальні вступники. Клік відкриває список.
      </Typography>
    </Paper>
  )
}
