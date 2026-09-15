import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'

type Props = {
  id: string
  title: string
  subtitle?: string
  defaultExpanded?: boolean
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  actions?: ReactNode
  children: ReactNode
}

export function CollapsibleSection({
  id,
  title,
  subtitle,
  defaultExpanded = true,
  expanded,
  onExpandedChange,
  actions,
  children,
}: Props) {
  const controlled = expanded !== undefined

  return (
    <Paper
      id={id}
      variant="outlined"
      sx={{ mb: 2, overflow: 'hidden', scrollMarginTop: 72 }}
      className="stat-section"
    >
      <Accordion
        disableGutters
        elevation={0}
        defaultExpanded={controlled ? undefined : defaultExpanded}
        expanded={controlled ? expanded : undefined}
        onChange={(_, next) => onExpandedChange?.(next)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            px: 2,
            '& .MuiAccordionSummary-content': {
              my: 1.25,
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              pr: 1,
            },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && (
            <Box
              className="screen-only"
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              sx={{ display: 'flex', gap: 1, flexShrink: 0 }}
            >
              {actions}
            </Box>
          )}
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>{children}</AccordionDetails>
      </Accordion>
    </Paper>
  )
}
