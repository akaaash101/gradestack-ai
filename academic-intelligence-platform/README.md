# Deterministic Academic Intelligence Platform

A production-ready academic analytics monorepo that delivers deterministic insights, forecasting, and planning with transparent algorithms only.

## Core Guarantees
- No OpenAI, Anthropic, Gemini, or any LLM/chatbot API integration.
- All recommendations are generated from explicit rules and templates.
- All metrics are computed from persisted student/course data.

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind + Recharts
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- UI Foundation: Tailwind with reusable dashboard components (shadcn/ui-compatible patterns)

## Monorepo Structure
```txt
apps/
  api/
    prisma/
      schema.prisma
      seed.ts
      migrations/
        migration_lock.toml
        20260522193000_init/migration.sql
    src/
      app.ts
      server.ts
      config/
      controllers/
      engines/
      repositories/
      routes/
      services/
      types/
      utils/
  web/
    src/
      App.tsx
      lib/api.ts
      components/
      types/
```

## Required Key Files Included
### Backend
- `apps/api/src/server.ts`
- `apps/api/src/app.ts`
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/seed.ts`
- `apps/api/src/engines/academic-analytics.engine.ts`
- `apps/api/src/engines/recommendation.engine.ts`
- `apps/api/src/engines/study-planner.engine.ts`
- `apps/api/src/services/analytics.service.ts`

### Frontend
- `apps/web/src/App.tsx`
- `apps/web/src/lib/api.ts`

## Setup
1. Install dependencies
```bash
npm install
```

2. Configure environment variables
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

3. Generate Prisma client
```bash
npm run prisma:generate -w apps/api
```

4. Apply migrations
```bash
npm run prisma:migrate -w apps/api
```

5. Seed sample student data
```bash
npm run prisma:seed -w apps/api
```

6. Start backend + frontend
```bash
npm run dev
```

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

## API Endpoint
- `GET /api/analytics/dashboard`
  - Optional query: `studentId`
  - Returns deterministic dashboard payload with analytics, recommendations, forecast, velocity, and study plan.

## What the System Computes
- Weighted grade calculations and course-level current standing
- Grade forecasting and projected final scores
- Difficulty, risk, and burnout indicators
- Goal gap calculations (required score on remaining work)
- GPA trend signals and semester projection confidence
- Priority-based smart weekly study scheduling
- Rule-based recommendation generation

## Frontend Dashboard Includes
- GPA trend graphs
- Risk heatmap table
- Performance forecasting chart
- Course comparison analytics
- Study efficiency metrics
- Semester projection KPIs
- Completion velocity chart
- Weekly adaptive study planner

## Build and Validation
```bash
npm run lint
npm run build
```

## No-AI Policy
This platform intentionally removes and excludes:
- OpenAI API
- Anthropic API
- Gemini API
- External LLM services
- Chatbot integrations

All outputs are deterministic and explainable through backend logic.
