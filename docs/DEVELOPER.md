# Інструкція для розробників

Стек: **Vite 8 + React 19 + TypeScript + MUI 9 + React Router 7**. Client-only: Excel/CSV парсяться в браузері (`xlsx`, власний CSV-парсер у статистиці).

## Швидкий старт

```bash
npm install
npm run dev          # localhost
npm run build        # tsc -b && vite build
npm test             # vitest
npm run lint         # oxlint
```

## Структура

```
src/
  App.tsx                 # маршрути
  layout/AppLayout.tsx    # сайдбар
  pages/                  # тонкі сторінки
  features/
    sprava/               # особові справи
      components/
      hooks/              # useSprava, useFormHost
      lib/                # parse, forms, photos, docx, fileCache, session
      forms.css
    statystyka/           # статистика
      components/
      hooks/useStatystyka.ts
      lib/                # worker, store, parsers, fileCache, export
  theme.ts
reference/                # HTML-прототипи (джерело правди для бізнес-логіки)
docs/                     # USER.md, цей файл
```

## Архітектура фіч

### Session store

Обидві фічі використовують **module-level store** + `useSyncExternalStore`:

- `features/*/lib/sessionStore.ts` — стан сесії вкладки
- Restore з IndexedDB через `ensure*CacheRestored`, щоб React Strict Mode не запускав два паралельні restore

Не дублюйте важкий стан у `useState` сторінки — пишіть у session / localStorage / IDB.

### Sprava

| Модуль | Роль |
| ------ | ---- |
| `parseExcel.ts` | `.xlsx/.xls/.csv` → заявки «До наказу» + `statusSamples` |
| `forms.ts` | HTML Н-2.01 / Н-1.03.1 |
| `photos.ts` | Map фото за № справи, capture-делегування кліків |
| `formHost.ts` / `useFormHost` | contentEditable + фото після mount HTML |
| `generateDocx.ts` + `docxTemplateB64.ts` | Word з шаблону + JSZip |
| `fileCache.ts` | IndexedDB, TTL 12 год |
| `storage.ts` | settings + orderConfig у localStorage |

Форми поки що **HTML-рядки** + `dangerouslySetInnerHTML` (як у прототипі). Редагування тексту — contentEditable; фото — окремий store, не в HTML-стані React.

Пакетний перегляд — `createPortal` поверх layout (повноекранно).

### Statystyka

| Модуль | Роль |
| ------ | ---- |
| `statystyka.worker.ts` + `store.ts` | важкий парсинг/агрегація поза UI-потоком |
| `fileCache.ts` | CSV у IndexedDB |
| `parsers.ts` / `csvParser.ts` | нормалізація полів ЄДЕБО |
| `printTable.ts` | друк одного фрагмента (`body.print-single-table`) |

Зміна encoding → `loadCachedFile()` + повторний `loadFile`.

## Масштабування (scale)

### Обсяг даних

- **Статистика**: тримайте агрегації у worker; UI отримує готові summary/detail. Не тягніть усі AppTuple у кожен компонент.
- **Sprava**: не рендерьте тисячі `contentEditable` сторінок одразу — користувач зобов’язаний обрати спеціальність. Для дуже великих пакетів додайте віртуалізацію або «друкувати порціями».
- Фото як dataURL у `Map` — пам’ять росте лінійно; при потребі — IndexedDB blobs + object URLs.

### Нові поля ЄДЕБО

1. Додайте константу в `COL` / `REQUIRED_COLUMNS`.
2. Оновіть парсер і тести.
3. Підставте у `forms.ts` / DOCX placeholders / таблиці UI.
4. Звірте з `reference/*.html`, якщо поведінка вже була в прототипі.

### Нова сторінка / фіча

1. `src/features/<name>/` з `lib/`, `hooks/`, `components/`.
2. Тонка `src/pages/<Name>Page.tsx`.
3. Маршрут у `App.tsx` + пункт у `AppLayout` navItems.
4. Окремий IndexedDB `DB_NAME`, якщо є ПДн-файли.
5. Оновіть `docs/USER.md` і цей файл.

### Продуктивність UI

- Debounce дорогих оновлень (приклад: пороги в SpecialtySummary).
- Lazy-load важких чартів (`React.lazy` уже для SummaryCharts).
- Не тримайте дубль CSS для друку без потреби — для sprava екранний `forms.css` і компактний `FORM_PRINT_CSS` у `printForms.ts` мають лишатися синхронними для фото/`chk`.

### Безпека / ПДн

- Ніколи не логуйте повні ПІБ/РНОКПП у production.
- TTL кешу файлів — обов’язковий для Excel/CSV.
- `xlsx` має відомі advisory — оновлюйте залежності, обмежте тип файлів у input.

## Тести

- Unit: `*.test.ts` поруч із lib (vitest).
- Після змін парсерів / фільтрів / photos — `npm test`.
- Перед PR: `npm run build && npm run lint`.

## Документація

| Файл | Аудиторія |
| ---- | --------- |
| [USER.md](./USER.md) | оператори ПК |
| [DEVELOPER.md](./DEVELOPER.md) | розробники |
| `README.md` | швидкий огляд репо |

Прототипи в `reference/` — не підключаються до збірки; використовуйте як специфікацію при портуванні.
