# Admissions Toolkit

Інструменти приймальної комісії на **Vite + React + TypeScript + MUI**.

Дані з ЄДЕБО (Excel/CSV) обробляються локально в браузері.

## Запуск

```bash
npm install
npm run dev
```

## Сторінки

| Шлях | Опис |
| ---- | ---- |
| `/sprava` | Особові справи (форми Н-2.01 / Н-1.03.1, фото, DOCX) |
| `/statystyka` | Статистика вступників |

## Документація

- [Інструкція користувача](docs/USER.md)
- [Інструкція розробника](docs/DEVELOPER.md) — структура, скейлінг, як додавати фічі

## Структура

- `src/layout/` — оболонка з лівим меню
- `src/pages/` — сторінки-роути
- `src/features/sprava/` — особові справи
- `src/features/statystyka/` — статистика
- `reference/` — оригінальні HTML-прототипи
- `docs/` — інструкції

## Скрипти

| Команда | Опис |
| ------- | ---- |
| `npm run dev` | локальний сервер |
| `npm run build` | production-збірка |
| `npm run preview` | перегляд збірки |
| `npm run lint` | oxlint |
| `npm test` | vitest |
