# Delcom Blog — Frontend (ReactJS SPA)

Antarmuka Single Page Application multi-tier (Publik, Penulis, Admin) berbasis **React 19 + Vite + Tailwind CSS 4**
yang mengonsumsi REST API backend Golang Gin (port 8081).

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5174  (proxy /api -> http://localhost:8081)
```

Pastikan backend sudah berjalan: `go run cmd/server/main.go` pada folder backend.

## Pengujian (100% coverage)

```bash
npm test           # vitest run --coverage (threshold 100% statements/branches/functions/lines)
```

## Rute SPA

| Path | Komponen | Akses |
| --- | --- | --- |
| `/` atau `/public` | PublicArticleList | Publik |
| `/posts/:slug` | PublicArticleDetail | Publik |
| `/login` | AuthPage (mode login) | Publik |
| `/register` | AuthPage (mode register) | Publik |
| `/author` | AuthorDashboard | Penulis (login) |
| `/admin` | AdminDashboard | Admin |

## Build & Deploy Terpisah

```bash
npm run build      # hasil statis di dist/
```

Set `VITE_API_BASE_URL` (lihat `.env.example`) ke URL backend saat build untuk hosting statis.
`public/_redirects` (Netlify) dan `vercel.json` (Vercel) sudah menyediakan fallback SPA ke `index.html`.
