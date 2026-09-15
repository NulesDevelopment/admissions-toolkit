import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { BUDGET_ORDER, type OrderConfigRow } from '../types'

function HelpTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: (string | ReactNode)[][]
}) {
  return (
    <TableContainer
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1.5,
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            {headers.map((h) => (
              <TableCell key={h} sx={{ fontWeight: 600 }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i} sx={{ bgcolor: i % 2 ? 'grey.50' : undefined }}>
              {row.map((cell, j) => (
                <TableCell key={j} sx={{ verticalAlign: 'top' }}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

type Props = {
  orderConfig?: OrderConfigRow[]
}

export function SpravaHelp({ orderConfig = [] }: Props) {
  const savedRows = orderConfig.filter(
    (r) => r.date.trim() || r.orderNumbers.trim(),
  )

  return (
    <Paper variant="outlined" sx={{ mb: 2.5, overflow: 'hidden' }}>
      <Accordion disableGutters elevation={0} defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>Як користуватись</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography
            component="ol"
            sx={{ m: 0, pl: 2.5, lineHeight: 1.85, fontSize: 14 }}
          >
            <li>
              Вивантаж файл із ЄДЕБО (експорт заявок вступника —
              формат <strong>.xlsx</strong>, <strong>.xls</strong> або{' '}
              <strong>.csv</strong>).
            </li>
            <li>
              Заповни поля <strong>Налаштування</strong> нижче — особливо{' '}
              <em>Термін навчання</em> та <em>Відповідального секретаря</em>.
              Значення зберігаються у браузері між сесіями.
            </li>
            <li>
              Якщо зʼявились нові накази з новою датою — натисни{' '}
              <strong>«Дати наказів…»</strong> і додай рядок із датою та
              номерами через кому. Дата підставляється автоматично для кожного
              вступника за номером його наказу.
            </li>
            <li>
              Перетягни або вибери файл у зону завантаження. Програма залишить
              лише вступників зі статусом <strong>«До наказу»</strong>.
            </li>
            <li>
              Обовʼязково обери <strong>спеціальність</strong> у фільтрах — без
              неї список не будується. Далі можна звузити за факультетом, формою
              навчання, фінансуванням або пошуком за ПІБ.
            </li>
            <li>
              Натисни <strong>«Переглянути»</strong> навпроти вступника —
              відкриється вікно з формами Н-2.01 і Н-1.03.1. Текст у формах
              можна редагувати прямо у вікні перед друком (клік на поле).
            </li>
            <li>
              Щоб роздрукувати / зберегти PDF — натисни{' '}
              <strong>«Роздрукувати цю заяву»</strong> у вікні перегляду. Кожна
              справа — рівно 2 сторінки A4.
            </li>
            <li>
              Щоб сформувати всі відфільтровані справи разом — натисни{' '}
              <strong>«Згенерувати форми»</strong> (повноекранний пакет) або{' '}
              <strong>«DOCX»</strong> для Word одного вступника. Файл Excel/CSV
              кешується в браузері на 12 годин.
            </li>
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>Конфіг наказів і дати</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ mb: 1.5, lineHeight: 1.8, fontSize: 14 }}>
            Кнопка <strong>«Дати наказів…»</strong> у налаштуваннях відкриває
            таблицю відповідності: дата → номери наказів. Дата наказу у формі
            Н-2.01 підставляється <em>автоматично</em> — програма шукає номер
            наказу вступника в цій таблиці.
          </Typography>
          <HelpTable
            headers={['Дія', 'Як зробити']}
            rows={[
              [
                'Додати нову дату (новий пакет наказів)',
                <>
                  Натисни <strong>«Додати дату»</strong>, введи дату у форматі{' '}
                  <em>ДД.ММ.РРРР</em> і номери наказів через кому
                </>,
              ],
              [
                'Дописати номери до існуючої дати',
                'Відкрий конфіг, знайди потрібний рядок і допиши номери через кому в кінці поля',
              ],
              [
                'Змінити дату існуючих наказів',
                'Відредагуй поле дати в потрібному рядку',
              ],
              [
                'Видалити застарілу дату',
                'Натисни іконку кошика праворуч від рядка',
              ],
            ]}
          />
          <Box
            sx={{
              bgcolor: 'rgba(42,122,58,0.08)',
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              borderRadius: 1,
              px: 1.75,
              py: 1.25,
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            <Typography component="div" sx={{ fontWeight: 700, mb: 0.5, fontSize: 13 }}>
              Збереження
            </Typography>
            Після «Зберегти» таблиця дат і номерів пишеться в{' '}
            <strong>localStorage</strong> цього браузера. Наступного року просто
            онови дати й номери — Excel при завантаженні конфіг не скидає.
            {savedRows.length > 0 ? (
              <Box component="ul" sx={{ m: '8px 0 0', pl: 2.25 }}>
                {savedRows.map((r) => (
                  <li key={r.id}>
                    {r.date || '—'} — {r.orderNumbers || 'немає номерів'}
                  </li>
                ))}
              </Box>
            ) : (
              <Typography
                component="div"
                sx={{ mt: 0.75, color: 'text.secondary', fontSize: 13 }}
              >
                Зараз збережених рядків немає — додай їх через «Дати наказів…».
              </Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>
            Як визначається бюджет / контракт
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ mb: 1.5, lineHeight: 1.8, fontSize: 14 }}>
            Програма читає колонку <strong>«Наказ про зарахування»</strong> і
            шукає в ній число <strong>{BUDGET_ORDER}</strong>.
          </Typography>
          <HelpTable
            headers={['Що в колонці «Наказ»', 'Фінансування']}
            rows={[
              [
                <>
                  Містить «{BUDGET_ORDER}» (напр.{' '}
                  <em>«{BUDGET_ORDER} СК від 13.08.2026»</em>)
                </>,
                <Typography
                  component="span"
                  sx={{ color: 'success.dark', fontWeight: 700 }}
                >
                  Бюджет
                </Typography>,
              ],
              [
                'Будь-який інший номер наказу',
                <Typography
                  component="span"
                  sx={{ color: 'error.dark', fontWeight: 700 }}
                >
                  Контракт
                </Typography>,
              ],
            ]}
          />
          <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 13, lineHeight: 1.7 }}>
            Номер наказу витягується автоматично (цифри перед «СК»). Дата береться
            з конфігу наказів, а не з тексту колонки. Для контракту у форму
            Н-1.03.1 додається рядок про договір платної освітньої послуги.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>
            Чого немає в ЄДЕБО — вводити вручну
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <HelpTable
            headers={['Поле у формі', 'Де вводити', 'Примітка']}
            rows={[
              [
                'Термін навчання',
                <>
                  Налаштування → <em>Термін навчання</em>
                </>,
                <>
                  напр.: <strong>3 р. 10 міс</strong>
                </>,
              ],
              [
                'Рік вступу',
                <>
                  Налаштування → <em>Рік вступу</em>
                </>,
                <>
                  за замовчуванням <strong>2026</strong>
                </>,
              ],
              [
                'Дати наказів',
                <>
                  Налаштування → <em>Дати наказів…</em>
                </>,
                'додавай нові рядки, коли зʼявляться накази з новою датою',
              ],
              [
                'Відповідальний секретар',
                <>
                  Налаштування → <em>Відповідальний секретар</em>
                </>,
                'зберігається в браузері після введення',
              ],
              [
                'Паспорт, виданий до 01.08.2022',
                'у вікні перегляду (поле редагується)',
                'серія, номер, дата й орган лишаються порожніми — вписати вручну',
              ],
              [
                'Таблиця документів (Н-1.03.1)',
                'після друку — від руки',
                'кількість аркушів, дата і місце вилучення, дата повернення',
              ],
              [
                'Фото вступника',
                'рамка на формі Н-1.03.1',
                'клік — обрати файл; перетягування / колесо / + − / ⤢',
              ],
            ]}
          />

          <Box
            sx={{
              mt: 0.5,
              bgcolor: 'rgba(249,168,37,0.12)',
              borderLeft: '4px solid #f9a825',
              borderRadius: 1,
              px: 1.75,
              py: 1.5,
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            <Typography component="div" sx={{ fontWeight: 700, mb: 0.75, fontSize: 13 }}>
              Після друку заповнити від руки
            </Typography>
            Підпис відповідального секретаря —{' '}
            <strong>ставиться від руки</strong> на роздрукованому бланку.
            <br />
            Якщо паспорт виданий <strong>до 01.08.2022</strong> — рядок
            «Виданий» порожній: вписати серію, номер, дату та орган з документа
            вступника.
            <br />
            У таблиці документів — колонки «Кількість аркушів», «Дата вилучення»
            та «Дата повернення» після фізичного прийому документів.
          </Box>

          <Typography
            sx={{ mt: 1.5, color: 'text.secondary', fontSize: 13, lineHeight: 1.7 }}
          >
            Усі інші поля (ПІБ, факультет, спеціальність, документ про освіту,
            посвідчення особи, категорія зарахування, джерело фінансування тощо)
            заповнюються <strong>автоматично</strong> з Excel ЄДЕБО. Жовтим
            підсвічені значення, які зручно перевірити перед друком.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Paper>
  )
}
