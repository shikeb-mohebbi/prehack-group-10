# FitAI Coach

FitAI Coach is an AI-powered fitness and nutrition web application for university students, gym beginners, busy individuals, home workout users, and casual fitness enthusiasts. It helps users create personalised workout plans, meal plans, supplement guidance, calorie estimates, and beginner-friendly fitness recommendations — all from one dashboard.

---

## Members and Features

| Member | Feature |
|--------|---------|
| EHSAN  | Authentication System — register, login, logout, protected routes User Goal Setup & Profile — age, weight, height, goal, experience AI Workout Generator — personalised weekly workout plans AI Meal Planner — calorie-targeted daily meal plans  AI Personal Chatbot — fitness and nutrition Q&A |
|SHIKEB| AI Calorie Check by Photo — meal photo and description analysis Supplement AI Suggestions — goal-matched supplement recommendations Dashboard & Music Bar — summary dashboard and workout music player |

---

## Features

| Feature | Description |
|---------|-------------|
| Authentication System | Users register, login, and logout securely via JWT httpOnly cookies |
| User Goal Setup | Users enter age, weight, height, fitness goal, and workout experience level |
| AI Workout Generator | AI creates personalised workout plans based on goal, experience, and equipment |
| AI Meal Planner | AI generates daily meal plans with calorie targets and dietary preferences |
| AI Personal Chatbot | Users ask fitness and nutrition questions and receive AI guidance instantly |
| AI Calorie Check by Photo | Users upload food photos or describe meals; AI estimates calories and macros |
| Supplement AI Suggestions | AI recommends beginner-safe supplements based on goal, diet, and budget |
| Music Bar | Integrated workout music player with track control and volume slider |
| Dashboard | Displays goal summary, streak, motivational quotes, latest workout and meal plan |

---

## Technology Stack

| Area | Technology |
|------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | Prisma ORM, SQLite |
| Authentication | JWT with httpOnly cookies |
| AI Integration | Groq API (Llama 3.1) |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack React Query |

---

## Project Structure

Shared files cover app entry points, providers, API client, routing registration, middleware, Prisma client, and configuration. Feature implementation code lives exclusively inside each feature module folder.

```
fitai-coach/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts              # Express app entry, route registration
│   │   ├── lib/
│   │   │   ├── prisma.ts         # Prisma client singleton
│   │   │   └── groq.ts           # Groq API wrapper
│   │   ├── middleware/
│   │   │   └── auth.ts           # JWT middleware, signToken, setAuthCookie
│   │   └── modules/
│   │       ├── auth/             # Member 1
│   │       │   ├── controllers/
│   │       │   ├── models/
│   │       │   ├── routers/
│   │       │   ├── schemas/
│   │       │   └── types/
│   │       ├── profile/          # Member 2
│   │       ├── workouts/         # Member 3
│   │       ├── meals/            # Member 4
│   │       ├── chat/             # Member 5
│   │       ├── calorie-check/    # Member 6
│   │       └── supplements/      # Member 7
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── src/
    │   ├── main.tsx              # React entry, providers
    │   ├── App.tsx               # Route aggregation
    │   ├── index.css             # Tailwind + design system
    │   ├── components/           # Shared UI components
    │   ├── context/
    │   ├── lib/
    │   ├── types/
    │   └── modules/
    │       ├── auth/             # Member 1
    │       │   ├── apis/
    │       │   ├── components/
    │       │   ├── pages/
    │       │   ├── routers/
    │       │   ├── schemas/
    │       │   └── types/
    │       ├── profile/          # Member 2
    │       ├── workouts/         # Member 3
    │       ├── meals/            # Member 4
    │       ├── chat/             # Member 5
    │       ├── calorie-check/    # Member 6
    │       ├── supplements/      # Member 7
    │       ├── dashboard/        # Member 8
    │       ├── music/            # Member 8
    │       └── landing/
    └── package.json
```

Each feature module follows this exact layout:

```
frontend/src/modules/<feature-name>/
  apis/          API call functions (axios)
  components/    Module-scoped React components
  pages/         Full page components
  routers/       Route definitions exported to App.tsx
  schemas/       Zod validation schemas
  types/         TypeScript types and interfaces

backend/src/modules/<feature-name>/
  controllers/   Request handlers
  models/        Business logic and data transformers
  routers/       Express router
  schemas/       Zod validation schemas
  types/         TypeScript types and interfaces
```

---

## APIs Implemented

| Method | Route | Auth | Description |
|--------|-------|:----:|-------------|
| GET | `/api/health` | | API health check |
| POST | `/api/auth/register` | | Create account and set auth cookie |
| POST | `/api/auth/login` | | Login and set auth cookie |
| POST | `/api/auth/logout` | | Logout and clear auth cookie |
| GET | `/api/auth/me` | ✓ | Get current authenticated user |
| GET | `/api/profile` | ✓ | Get user profile |
| PUT | `/api/profile` | ✓ | Save/update profile and onboarding data |
| POST | `/api/workouts/generate` | ✓ | Generate and save AI workout plan |
| GET | `/api/workouts` | ✓ | List all saved workout plans |
| PATCH | `/api/workouts/:planId/exercise/:exId` | ✓ | Toggle exercise done/undone |
| DELETE | `/api/workouts/:planId` | ✓ | Delete workout plan |
| POST | `/api/meals/generate` | ✓ | Generate and save AI meal plan |
| GET | `/api/meals` | ✓ | List all saved meal plans |
| DELETE | `/api/meals/:planId` | ✓ | Delete meal plan |
| GET | `/api/chat` | ✓ | Get chat history (last 100 messages) |
| POST | `/api/chat` | ✓ | Send message to AI coach |
| DELETE | `/api/chat` | ✓ | Clear all chat messages |
| POST | `/api/calorie/analyze` | ✓ | Estimate calories from photo or description |
| GET | `/api/calorie` | ✓ | List all calorie analyses |
| DELETE | `/api/calorie/:analysisId` | ✓ | Delete calorie analysis |
| POST | `/api/supplements/suggest` | ✓ | Generate AI supplement suggestions |
| GET | `/api/supplements` | ✓ | List all saved supplement suggestions |
| DELETE | `/api/supplements/:suggestionId` | ✓ | Delete supplement suggestion |
| POST | `/api/auth/forgot-password` | | Send password reset email |
| POST | `/api/auth/reset-password` | | Reset password using token from email |

---

## Prerequisites

- Node.js v18 or later
- npm v9 or later

---

## Setup and Run

### 1. Clone the repository

```bash
git clone <repository-url>
cd fitai-coach
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and fill in your values:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="change_me_to_a_long_random_string_at_least_32_chars"
GROQ_API_KEY="your_groq_api_key_here"
GROQ_MODEL="llama-3.1-8b-instant"
GROQ_VISION_MODEL=""
PORT=4000
CLIENT_URL="http://localhost:5173"
```

Run migrations and start the dev server:

```bash
npx prisma migrate dev
npm run dev
```

Backend runs at `http://localhost:4000`.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

By default the frontend calls `/api`, which is proxied to the backend by Vite in development. If the API is hosted separately, set `VITE_API_URL` in `frontend/.env`, for example `VITE_API_URL="http://localhost:4000/api"`.

### 4. Open the app

Visit `http://localhost:5173`, register an account, complete onboarding, and start using the features.

---

## Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | Yes | SQLite file path, e.g. `file:./dev.db` |
| `JWT_SECRET` | Yes | Secret key for JWT tokens (min 32 chars) |
| `GROQ_API_KEY` | Yes | API key from [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | No | Text model (default: `llama-3.1-8b-instant`) |
| `GROQ_VISION_MODEL` | No | Vision model for food photo calorie analysis |
| `PORT` | No | Backend port (default: `4000`) |
| `CLIENT_URL` | No | Frontend origin for CORS (default: `http://localhost:5173`). Comma-separate multiple origins if needed. |
| `SMTP_HOST` | For email | SMTP server host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | For email | SMTP port (e.g. `587`) |
| `SMTP_SECURE` | For email | `"true"` for port 465, `"false"` for 587 |
| `SMTP_USER` | For email | SMTP login email address |
| `SMTP_PASS` | For email | SMTP password or app password |
| `SMTP_FROM` | For email | Sender display name and address |

`GROQ_VISION_MODEL` is optional. Without it, calorie analysis falls back to text-based estimation using the meal description only; photo-only analysis requires a configured Groq vision model.

`SMTP_USER` and `SMTP_PASS` are required to actually send password reset emails. In local development without SMTP credentials, password reset links are written to the backend console so the flow can still be tested safely.

For Gmail: enable 2-Step Verification and create an **App Password** at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords). Use the 16-character app password as `SMTP_PASS`.

---

## Backend npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled `dist/index.js` |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:generate` | Regenerate Prisma client |

## Frontend npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |

---

## Git Workflow

Feature branches follow this naming convention:

```bash
git checkout -b feature/<feature-name>
```

Examples:

```
feature/auth
feature/profile
feature/workouts
feature/meal-planner
feature/chat
feature/calorie-check
feature/supplements
feature/dashboard
```

Before final submission:

1. Open a pull request from each feature branch into `main`
2. Review and merge all feature branches
3. Confirm the app starts and runs cleanly from `main`
4. Keep all feature branches — do not delete them

---

## Database Models

| Model | Description |
|-------|-------------|
| `User` | Account info and profile fields (age, weight, height, goal, experience) |
| `WorkoutPlan` | Saved AI-generated workout plans with exercise data as JSON |
| `MealPlan` | Saved AI-generated meal plans with meal data as JSON |
| `ChatMessage` | Per-user chat history (role: `user` or `assistant`) |
| `CalorieAnalysis` | Calorie estimates from food photos or descriptions |
| `SupplementSuggestion` | AI supplement suggestions with nutrition gaps and card data |
