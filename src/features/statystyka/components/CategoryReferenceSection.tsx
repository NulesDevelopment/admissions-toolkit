import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { CATEGORY_REFERENCE } from '../lib/categoryReference'

export function CategoryReferenceSection() {
  const rows = Object.entries(CATEGORY_REFERENCE).sort(
    (a, b) => Number(a[0]) - Number(b[0]),
  )

  return (
    <Paper variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
      <Accordion disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>
            Довідник пільгових категорій 2026
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Код</TableCell>
                  <TableCell>Категорія</TableCell>
                  <TableCell>Пільга / умова</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(([code, [title, benefit]]) => (
                  <TableRow key={code}>
                    <TableCell sx={{ fontWeight: 700 }}>{code}</TableCell>
                    <TableCell>{title}</TableCell>
                    <TableCell>{benefit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Paper>
  )
}
