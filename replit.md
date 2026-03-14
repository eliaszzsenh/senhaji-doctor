# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── dental-clinic/      # Dr. Senhaji Jalil dental clinic React+Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Artifacts

### Dr. Senhaji Jalil — Dental Clinic (`artifacts/dental-clinic`)

Full dental clinic website in Spanish for Dr. Senhaji Jalil, targeting patients in Valencia, Spain.

**Pages:**
- `/` — Home with hero, services preview, stats, about preview, testimonials, CTA
- `/about` — Full bio, languages, career timeline, skills
- `/services` — 6 dental services with detailed descriptions
- `/appointment` — Appointment booking form (POST /api/appointments)
- `/contact` — Contact form (POST /api/contact) + map + social links

**Components:**
- `Navbar` — Sticky, transparent → white on scroll, hamburger mobile menu
- `Footer` — 3-column footer, blue background
- `ChatWidget` — Floating chatbot (bottom-right), talks to POST /api/chat
- `FloatingCTA` — Orange floating "Reservar Cita" button

**Tech:**
- React + Vite + TailwindCSS
- Framer Motion animations
- Lucide React icons
- React Hook Form + Zod validation
- Wouter routing

### API Server (`artifacts/api-server`)

Express 5 REST API.

**Endpoints:**
- `GET/POST /api/appointments` — List and create appointments
- `GET/PUT/DELETE /api/appointments/:id` — Get, update, cancel appointment
- `POST /api/contact` — Contact form submission
- `POST /api/chat` — Chatbot (keyword intent detection + state machine)
- `GET /api/healthz` — Health check

## Database Schema

### `appointments` table
- id, name, email, phone, service, preferred_date, preferred_time, notes, status, created_at

### `contact_messages` table
- id, name, email, message, created_at

## Brand

- Primary: Orange (#F97316)
- Secondary: Blue (#1E40AF)
- Accent: Light blue (#DBEAFE)
- Language: Spanish (targeting Valencia, Spain)
- Font: Inter

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Codegen

After changing `lib/api-spec/openapi.yaml`, run:
```
pnpm --filter @workspace/api-spec run codegen
```
