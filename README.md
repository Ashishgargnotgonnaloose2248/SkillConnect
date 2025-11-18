# SkillConnect 🎓🤝

A full-stack campus skill-exchange platform that connects students, faculty, and mentors for peer-to-peer learning. This repository hosts both the production-ready REST API and the modern React client that powers SkillConnect.

## Platform Snapshot 🚦
- **Mission**: help learners discover, schedule, and run skill-sharing sessions on campus with built-in verification and analytics.
- **Architecture**: Node.js + Express API, MongoDB Atlas persistence, and a Vite-powered React/TypeScript frontend styled with Tailwind + shadcn/ui.
- **Core capabilities**: role-aware authentication, curated skill catalog, AI-assisted matching, rich session lifecycle, admin controls, and proactive email notifications.

## Key Platform Features ✨
- **Role-based security** with JWT auth, protected routes, and admin-only safeguards.
- **Skill marketplace** that lets users curate offered and desired skills with metadata, tags, and difficulty filters.
- **Session lifecycle management** covering scheduling, confirmations, cancellations, completions, and feedback loops.
- **Smart matching** powered by dedicated matching endpoints and supporting analytics so students quickly find relevant partners.
- **Automated communications** via the Nodemailer-based email module for onboarding, verification, and session updates.
- **Modern UX** with a responsive shadcn/ui component system, micro-interactions via Framer Motion, and accessible forms validated by Zod.

## Repository Structure 🗂️
```
SkillConnect/
├── backend/          # Node.js + Express API (modular controllers, MongoDB models, middleware)
├── frontend/         # Vite + React + TypeScript client (shadcn/ui components, routes, contexts)
└── README.md         # This file
```

## Folder-by-Folder Overview 📁
### Backend (`backend/`) ⚙️
```
backend/
├── src/
│   ├── controllers/    # Business logic per domain (auth, skills, sessions, admin)
│   ├── routes/         # Express routers mapping HTTP verbs to controllers
│   ├── models/         # Mongoose schemas for User, Skill, Session, etc.
│   ├── middlewares/    # Auth guards, admin gates, async error handling
│   ├── utils/          # Response helpers, email service, env parsing
│   └── db/             # Database connection bootstrap
├── test/               # Targeted backend specs (env utilities, etc.)
└── API_DOCUMENTATION.md
```

### Frontend (`frontend/`) 💻
```
frontend/
├── src/
│   ├── components/     # Reusable UI primitives (shadcn/ui) and app-specific widgets
│   ├── pages/          # Route-level screens (Dashboard, Sessions, Admin, etc.)
│   ├── contexts/       # Auth provider and other global contexts
│   ├── hooks/          # Custom hooks (responsive helpers, toast utilities)
│   ├── lib/            # API layer, utilities, and specs (`utils.spec.ts`)
│   └── global.css      # Tailwind layers and design tokens
├── public/             # Static assets (logos, robots.txt)
└── vite.config.ts     # Build and dev server configuration
```

## Technology Overview 🧰
- **Backend**: Node.js 18+, Express 5, MongoDB via Mongoose, JWT auth, bcrypt.js, Nodemailer, express-validator, cors, morgan.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix primitives), React Router, TanStack Query, React Hook Form + Zod, Framer Motion.
- **Tooling**: Nodemon for hot reloading, ESLint + TypeScript for static checks, Prettier formatting, PostCSS/Tailwind build pipeline.

## Prerequisites 📋
- Node.js v18 or newer (LTS recommended)
- npm (bundled with Node)
- MongoDB Atlas connection string or accessible MongoDB instance
- SMTP credentials (Gmail App Password or similar) for transactional emails

## Quick Start 🚀
```bash
# 1. Clone
git clone <repo-url>
cd SkillConnect

# 2. Install backend deps
cd backend
npm install

# 3. Install frontend deps
cd ../frontend
npm install
```

## Backend Service (`backend/`) 🛠️
### Environment Variables (`backend/.env`)
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/skillconnect
JWT_SECRET=super-secret-key
JWT_EXPIRY=7d
PORT=5000
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
EMAIL_USER=you@example.com
EMAIL_PASS=app-specific-password
EMAIL_FROM=SkillConnect <noreply@skillconnect.com>
```
### Scripts
- `npm run dev` – start Express with Nodemon (`src/index.js`).
- `npm start` – production start.

### Highlights
- Modular routes: `auth`, `user`, `skills`, `matching`, `sessions`, `admin`, `healthcheck` under `src/routes`.
- Controllers encapsulate domain logic; shared response helpers live in `src/utils`.
- Centralized error handling (`middlewares/error.middleware.js`) and auth/admin guards.
- API reference available in `backend/API_DOCUMENTATION.md`.

## Frontend Client (`frontend/`) 🎨
### Environment Variables (`frontend/.env.local`)
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=SkillConnect
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
```
### Scripts
- `npm run dev` – Vite dev server with fast HMR.
- `npm run build` – type-check (`tsc`) + production build.
- `npm run preview` – serve the production build locally.
- `npm run lint` – ESLint (TS + React rules, no warnings allowed).

### Highlights
- Route map lives in `src/App.tsx` with protected routes via `AuthContext` and role-aware guard support.
- Global UI system built with shadcn/ui + Tailwind (`src/components/ui`, `src/global.css`).
- Data fetching handled by TanStack Query; forms validated with React Hook Form + Zod.
- Animations and onboarding experiences powered by Framer Motion components in `src/pages/Index.tsx` and friends.

## Running the Platform Locally ▶️
1. **Start the API**
   ```bash
   cd backend
   npm run dev
   ```
2. **Start the client** (new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
3. Visit `http://localhost:5173` (default Vite port). The frontend proxies API calls to `VITE_API_URL`.

## Testing & Quality ✅
- Backend includes targeted specs (see `backend/test/`) and a health-check endpoint at `/api/v1/healthcheck` for uptime probes.
- Frontend enforces `npm run lint` before CI/CD promotion; utility specs live in `frontend/src/lib/utils.spec.ts` for quick regression checks.
- Form workflows rely on Zod schemas so invalid payloads are caught client-side before hitting the API.
- Recommended: run smoke tests against the matching and session endpoints after any domain change to ensure role-based permissions remain intact.

## Deployment Notes 🚢
- **Backend**: configure environment variables on your host, enable HTTPS, logging, and monitoring. Recommended to run `npm start` behind a process manager (PM2, systemd) and to restrict allowed origins via `CORS_ORIGIN`.
- **Frontend**: run `npm run build`, deploy the `dist/` output to your CDN or static host, and set the production `VITE_API_URL` before building.
- Suggested hosting targets include Vercel, Netlify, Cloudflare Pages, AWS Amplify, or any static bucket (S3, GCS) fronted by a CDN.
- For production, prefer a managed MongoDB Atlas cluster with IP allowlists and metrics enabled, plus uptime monitoring on `/api/v1/healthcheck`.

## Screenshots 🖼️
Add PNG/JPEG assets under `./screenshots` and reference them here for quick visual context:

```
## Screenshots

### Landing Page
![Landing](./screenshots/landing.png)

### Dashboard
![Dashboard](./screenshots/dashboard.png)
```

## License 📜
The final license will be added prior to release. Current candidates:
- MIT License – permissive, minimal restrictions.
- Apache-2.0 – permissive with explicit patent protection.
- AGPLv3 – ensures derivative SaaS offerings remain open.

## Additional Resources 🔗
- Detailed API reference: `backend/API_DOCUMENTATION.md`
- Frontend onboarding guide: `frontend/README.md`
- Tailwind/postcss configuration: `frontend/tailwind.config.js`, `postcss.config.js`

---
Crafted with care — Anurag Mishra & Ashish Garg
