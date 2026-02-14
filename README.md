# Skill Gap Analyzer

A full‑stack web app that helps users and teams identify skill gaps and get recommended learning steps. Built with a React + Vite frontend and an Express + Drizzle (Postgres) backend.

---

## 🚀 Quick start

Prerequisites
- Node.js (18+ recommended)
- PostgreSQL (or any Postgres-compatible DATABASE_URL)

Clone & install
```bash
npm install
```

Run (development)
```bash
npm run dev
# Server + Vite dev are integrated — open http://localhost:5000
```

Build & start (production)
```bash
npm run build
npm run start
```

Populate sample data
```bash
npm run seed
```

Database schema push (drizzle-kit)
```bash
npm run db:push
```

---

## ⚙️ Environment variables
Create a `.env` in project root (example):

```env
DATABASE_URL=postgres://user:pass@localhost:5432/skill_gap_db
SESSION_SECRET=your-secret
PORT=5000           # optional, defaults to 5000
NODE_ENV=development
```

Note: `DATABASE_URL` is required — the server will fail to start without it.

---

## 🧩 Features
- User registration & authentication (session + passport-local)
- Create & store user skills, job roles, and analyses
- Visual reports (radar charts, trend/history pages)
- Seed script with example data
- Drizzle ORM + Postgres schema (strong typed schemas in `shared/schema.ts`)

---

## 🗂️ Project structure (high level)
- `client/` — React + Vite frontend (TypeScript, Tailwind)
- `server/` — Express API, session handling, DB access
- `shared/` — routes and DB schema shared between client & server
- `script/` — build & seed helpers

---

## 🔧 Useful npm scripts
- `npm run dev` — start development server (includes Vite)
- `npm run build` — build for production
- `npm run start` — run built server
- `npm run seed` — insert sample data
- `npm run db:push` — apply Drift/Drizzle schema changes
- `npm run check` — TypeScript check

---

## 💡 Tips & troubleshooting
- If you see DB connection errors, confirm `DATABASE_URL` and that Postgres is running.
- Use `npm run seed` after `db:push` to add demo data.
- To change the port, set the `PORT` env var before starting.

---

## Contributing
PRs welcome. Please keep code style consistent and add tests for new logic where possible.

---

## License
MIT

---

If you want, I can add a `docs/` page, example Postgres Docker Compose, or CI workflows next. 👍

---

## 📁 Files & folders — what each item does
Below is a concise explanation of the top-level files and important folders in this repository.

- `components.json` — UI/component metadata used by the design system or story tooling.
- `drizzle.config.ts` — Drizzle ORM configuration for database migrations/schema management.
- `package.json` — npm scripts, dependencies, and project metadata (used to run, build, seed, and push DB schema).
- `postcss.config.js` — PostCSS plugins and configuration for CSS processing.
- `tailwind.config.ts` — Tailwind CSS configuration and theme customizations.
- `tsconfig.json` — TypeScript compiler options and path mappings.
- `vite.config.ts` — Vite build/dev server configuration for the client app.

- `attached_assets/` — miscellaneous files, design notes, or pasted documentation retained with the repo.

- `client/` — Frontend application (React + Vite + Tailwind)
  - `index.html` — App entry HTML used by Vite.
  - `src/main.tsx` — Frontend entry point (React + router + providers).
  - `src/App.tsx` — Main application component and top-level routes.
  - `src/index.css` — Tailwind + global styles.
  - `src/components/` — Reusable UI components and the app-specific components like `SkillRadarChart.tsx`.
  - `src/hooks/` — React hooks (auth, data fetching, mobile helper, toast helper).
  - `src/pages/` — Route pages (Dashboard, Analysis, Profile, History, Auth, etc.).
  - `src/lib/` — client-side utilities and `queryClient` for React Query.

- `script/` — Utility scripts
  - `build.ts` — custom production build helper.
  - `seed.ts` — seeds the database with sample/demo data.

- `server/` — Backend (Express + Drizzle + session/auth)
  - `index.ts` — Server bootstrap and HTTP server setup.
  - `routes.ts` — API route registration and validation wiring.
  - `auth.ts` — Session + Passport local strategy and login endpoints.
  - `db.ts` — Postgres pool and Drizzle ORM initialization.
  - `storage.ts` — Database access layer / repository methods used by routes.
  - `static.ts` — Static file serving in production.
  - `vite.ts` — Vite middleware integration for development server.

- `shared/` — Code shared between client and server
  - `routes.ts` — API route schemas and utilities used by both sides.
  - `schema.ts` — Drizzle DB schema + Zod insert/update types (single source of truth for DB shapes).

---
