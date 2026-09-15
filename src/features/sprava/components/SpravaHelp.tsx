import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

export function SpravaHelp() {
  return (
    <Paper variant="outlined" sx={{ mb: 2.5, overflow: 'hidden' }}>
      <Accordion disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>Як користуватись</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography component="ol" sx={{ m: 0, pl: 2.5, lineHeight: 1.8 }}>
            <li>Вивантаж Excel-файл із ЄДЕБО (експорт заявок вступника).</li>
            <li>
              Заповни поля <strong>Налаштування</strong> — особливо термін
              навчання та відповідального секретаря.
            </li>
            <li>
              За потреби відкрий <strong>Дати наказів</strong> і додай
              відповідність дати та номерів наказів.
            </li>
            <li>
              Завантаж файл — залишаться лише вступники зі статусом{' '}
              <strong>«До наказу»</strong>.
            </li>
            <li>Відфільтруй список і відкрий попередній перегляд форм.</li>
            <li>Відредагуй поля за потреби та роздрукуй / збережи PDF.</li>
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>Конфіг наказів і дати</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ mb: 1.5, lineHeight: 1.7 }}>
            Дата наказу у формі Н-2.01 підставляється автоматично за номером
            наказу вступника з таблиці відповідності.
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Дія</TableCell>
                <TableCell>Як зробити</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Додати нову дату</TableCell>
                <TableCell>
                  У діалозі натисни «Додати дату», введи ДД.ММ.РРРР і номери
                  через кому
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Змінити дату існуючих наказів</TableCell>
                <TableCell>Відредагуй поле дати в потрібному рядку</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
    </Paper>
  )
}
