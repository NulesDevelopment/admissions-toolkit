import { Box, Grid, Paper, Typography } from '@mui/material'
import { useMemo, type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SpecialtySummary } from '../lib/types'

const COLORS = {
  primary: '#2a7a3a',
  primarySoft: '#5fa86c',
  budget: '#2a7a3a',
  contract: '#3b82c4',
  above: '#2a7a3a',
  below: '#c45c26',
  apps: '#2a7a3a',
  cancelledApplicant: '#a12622',
  cancelledPriority: '#b45309',
  college: '#6b5b95',
  priority: [
    '#1f5c2b',
    '#2a7a3a',
    '#3d8f4e',
    '#55a463',
    '#6fb87a',
    '#3b82c4',
    '#5a9bd4',
    '#7eb0de',
    '#c45c26',
    '#d4784a',
  ],
}

type Props = {
  faculty: string
  specialties: SpecialtySummary[]
}

function shortLabel(specialty: string, max = 28): string {
  if (specialty.length <= max) return specialty
  return specialty.slice(0, max - 1) + '…'
}

function ChartCard({
  title,
  subtitle,
  height = 300,
  children,
}: {
  title: string
  subtitle?: string
  height?: number
  children: ReactNode
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 1.5 }}
        >
          {subtitle}
        </Typography>
      )}
      <Box sx={{ width: '100%', height }}>{children}</Box>
    </Paper>
  )
}

export function SummaryChartsSection({ faculty, specialties }: Props) {
  const bySpecialty = useMemo(
    () =>
      [...specialties]
        .sort((a, b) => b.persons - a.persons)
        .map((s) => ({
          name: shortLabel(s.specialty),
          fullName: s.specialty,
          persons: s.persons,
          college: s.college,
          budget: s.budget,
          contractOnly: s.contractOnly,
          claimsBudgetBelow130: s.claimsBudgetBelow130,
          above: s.above,
          below: s.below,
          apps: s.apps,
          cancelledByApplicant: s.cancelledByApplicant,
          cancelledPriority: s.cancelledPriority,
        })),
    [specialties],
  )

  const fundingPie = useMemo(() => {
    const budget = specialties.reduce((a, s) => a + s.budget, 0)
    const contractOnly = specialties.reduce((a, s) => a + s.contractOnly, 0)
    const claimsBudgetBelow130 = specialties.reduce(
      (a, s) => a + s.claimsBudgetBelow130,
      0,
    )
    return [
      { name: 'Бюджет ≥ 130', value: budget, color: COLORS.budget },
      { name: 'Лише контракт < 130', value: contractOnly, color: COLORS.contract },
      {
        name: 'Претендують на бюджет, але < 130',
        value: claimsBudgetBelow130,
        color: COLORS.below,
      },
    ].filter((x) => x.value > 0)
  }, [specialties])

  const prioritiesAgg = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, i) => ({
      priority: `П${i + 1}`,
      applicants: 0,
      applications: 0,
      budget: 0,
      contract: 0,
    }))

    for (const s of specialties) {
      for (const p of s.priorities) {
        const b = buckets[p.priority - 1]
        b.applicants += p.applicants
        b.applications += p.applications
        b.budget += p.budget
        b.contract += p.contract
      }
    }

    return buckets
  }, [specialties])

  const chartHeight = Math.max(280, bySpecialty.length * 36)

  if (specialties.length === 0) return null

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Діаграми — {faculty}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ChartCard
            title="Вступники за спеціальностями"
            subtitle="Унікальні вступники (за Ід персони) у межах спеціальності"
            height={chartHeight}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={bySpecialty}
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={160}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => [value, 'Вступників']}
                  labelFormatter={(_, payload) =>
                    String(payload?.[0]?.payload?.fullName ?? '')
                  }
                />
                <Bar dataKey="persons" name="Вступники" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <ChartCard
            title="Бюджет / контракт"
            subtitle="Розподіл вступників за конкурсним балом 130"
            height={chartHeight}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fundingPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius="70%"
                  label={({ percent }) =>
                    percent != null && percent >= 0.05
                      ? `${Math.round(percent * 100)}%`
                      : ''
                  }
                >
                  {fundingPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Вступників']} />
                <Legend verticalAlign="bottom" height={56} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title="Бал відносно порогу"
            subtitle="Поріг задається окремо для кожної спеціальності"
            height={Math.max(260, bySpecialty.length * 40)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={bySpecialty}
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  labelFormatter={(_, payload) =>
                    String(payload?.[0]?.payload?.fullName ?? '')
                  }
                />
                <Legend />
                <Bar
                  dataKey="above"
                  name="≥ порогу"
                  stackId="t"
                  fill={COLORS.above}
                />
                <Bar
                  dataKey="below"
                  name="< порогу"
                  stackId="t"
                  fill={COLORS.below}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title="Чинні та скасовані заяви"
            subtitle="По спеціальностях"
            height={Math.max(260, bySpecialty.length * 40)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={bySpecialty}
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  labelFormatter={(_, payload) =>
                    String(payload?.[0]?.payload?.fullName ?? '')
                  }
                />
                <Legend />
                <Bar
                  dataKey="apps"
                  name="Чинні"
                  stackId="a"
                  fill={COLORS.apps}
                />
                <Bar
                  dataKey="cancelledByApplicant"
                  name="Скас. вступником"
                  stackId="a"
                  fill={COLORS.cancelledApplicant}
                />
                <Bar
                  dataKey="cancelledPriority"
                  name="Втрата пріор."
                  stackId="a"
                  fill={COLORS.cancelledPriority}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ChartCard
            title="Пріоритети по факультету загалом"
            subtitle="Сума унікальних вступників і заяв за пріоритетами 1–10 по всіх спеціальностях"
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prioritiesAgg}
                margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="applicants"
                  name="Вступники"
                  fill={COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="applications"
                  name="Заяви"
                  fill={COLORS.primarySoft}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="budget"
                  name="Б (бюджет)"
                  fill={COLORS.budget}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="contract"
                  name="К (контракт)"
                  fill={COLORS.contract}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  )
}
