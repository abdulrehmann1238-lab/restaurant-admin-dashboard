# Mise — Restaurant Admin Dashboard

Interactive frontend prototype for a restaurant operations and management dashboard built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Recharts**, and **Lucide Icons**.

## Features

- **Introductory Landing Page**: Hero ambience video with reduced-motion/fallback image support, live service preview widget, feature highlights, product preview, and validated contact form.
- **Dashboard Overview**: KPI cards, interactive Revenue Overview chart (`Today`, `7 Days`, `30 Days`, `90 Days`), searchable recent orders, popular dishes, and operational activity feed.
- **Multi-Restaurant Switching**: Switch live between **The Olive Table** and **Garden Bistro**.
- **Orders Management**: Clickable status summary cards, multi-filter search, pagination, inline status actions, rejection confirmation dialogs, and order detail slide-over drawer.
- **Menu Management**: Category tabs with item counts, search/sort/availability filters, one-click availability toggle, add/edit dish modal with image preview/upload, and delete confirmation.
- **Sales & Analytics**: Date range presets + custom range, 6 revenue metrics, period comparison chart, order-type donut breakdown, best-selling products table, range-specific insights, and CSV export.
- **Staff Management**: Team summary KPIs, search and role/status filters, add/edit staff modal, role permissions preview, and account status management.
- **Settings & Persistence**: Restaurant profile editing, currency/time/date formatting, notification toggles, Light & Warm Dark modes, and `localStorage` persistence with demo reset.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Netlify Deployment

Preconfigured via [`netlify.toml`](netlify.toml) with:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback redirect (`/* -> /index.html`, status `200`) for React Router routes.
