# MakePlace

Full-stack student portfolio and management platform for STEM/Robotics makeplace academies in India.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Fastify, Prisma ORM, PostgreSQL
- **Storage:** Cloudflare R2 (S3-compatible presigned uploads)
- **Auth:** JWT with RBAC (admin, mentor, student)
- **AI:** Claude API for portfolio generation
- **Automation:** n8n webhook stubs
- **Deployment:** Docker Compose + Nginx

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for full stack)
- PostgreSQL (for local dev without Docker)

### Setup

```bash
# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start PostgreSQL (or use Docker)
docker compose up postgres -d

# Run migrations and seed
cd apps/api
npx prisma migrate dev
npm run db:seed

# Start dev servers (from root)
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001
- n8n: http://localhost:5678

### Demo Accounts

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@makeplace.in    | password123 |
| Mentor  | mentor@makeplace.in   | password123 |
| Student | student@makeplace.in  | password123 |

### Docker (full stack)

```bash
cp .env.example .env
docker compose up --build
```

Access via http://localhost (Nginx reverse proxy).

## Features

### Student Management
- Add/edit student profiles with program and studio assignment
- Photo upload via R2 presigned URLs

### Projects
- Student project CRUD with tags and draft/publish status
- Drag-and-drop media upload (images, videos, files)
- Mentor comment threads on projects

### AI Portfolio
- Claude-powered portfolio generation from projects and badges
- Chat interface to refine portfolio content
- Public portfolio URL with QR code
- Gujarati language toggle on parent portal
- Draft/publish toggle (mentor review)

### Mentor Tools
- Weekly report editor per student
- Badge award system
- Comments on projects and portfolios

### n8n Webhooks (stubs)
- `POST /api/webhooks/report-created`
- `POST /api/webhooks/badge-awarded`
- `POST /api/webhooks/portfolio-published`
- `POST /api/webhooks/weekly-digest`

## Project Structure

```
makeplace/
├── apps/
│   ├── api/          # Fastify backend
│   └── web/          # Next.js frontend
├── nginx/            # Reverse proxy config
├── docker-compose.yml
└── .env.example
```

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for JWT signing
- `ANTHROPIC_API_KEY` — Claude API key for portfolio generation
- `R2_*` — Cloudflare R2 credentials for file uploads
