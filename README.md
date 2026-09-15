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
| `/sprava` | Особові справи (форми Н-2.01 / Н-1.03.1) |
| `/statystyka` | Статистика вступників |

## Структура

- `src/layout/` — оболонка з лівим меню
- `src/pages/` — сторінки-роути
- `src/features/sprava/` — компоненти особових справ
- `src/features/statystyka/` — компоненти статистики
- `reference/` — оригінальні HTML-прототипи

## Скрипти

| Команда | Опис |
| ------- | ---- |
| `npm run dev` | локальний сервер |
| `npm run build` | production-збірка |
| `npm run preview` | перегляд збірки |
| `npm run lint` | oxlint |
