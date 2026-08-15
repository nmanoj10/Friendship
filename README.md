# 👯 Know Me? — Friendship Test

How well do your friends really know you? Create a friendship test, share a unique link, and
discover who actually knows you best — with a live dashboard, leaderboard and question analytics.

## ✨ Features

- **Create a test** — pick 15 questions from a curated bank (Food, College, Personality,
  Entertainment, Personal & Fun) **or write your own**, then set your answers as **MCQ** or
  **text**.
- **Accounts** — sign up with just a username + password (no email) and every test you create is
  saved to your account, visible any time under **My Tests**.
- **Unique share link** — every test gets a short code: `yourapp.com/t/Ab82Kx`
- **One question at a time** — Kahoot-style quiz with a progress bar and instant ✅/❌ feedback.
  No skipping — every question must be answered.
- **Secure by design** — correct answers are **never** sent to the quiz taker's browser. The
  backend validates every answer via `POST /answer`.
- **Fun results** — score, percentage, friendship level (Stranger 😭 → You Basically Live
  Together 😂), full answer breakdown, confetti 🎉 and shareable results (Web Share API).
- **Creator dashboard** — total attempts, average/highest/lowest score, leaderboard, score
  distribution chart, correct-vs-wrong donut, recent attempts, per-question analytics and
  per-friend answer detail.
- **Simple auth** — creating tests requires a username + password account (JWT tokens, scrypt
  password hashing). Taking a test stays login-free; the dashboard remains protected by a private,
  unguessable token.
- **Refresh-safe quiz** — progress (attempt + current question) is saved to localStorage.

## 🗂 Project structure

```
friendship-test/
├── backend/          # Node.js + Express + Mongoose API
│   ├── src/
│   │   ├── config/   # db.js (MongoDB connection)
│   │   ├── models/   # Test, Attempt (Mongoose schemas)
│   │   ├── controllers/  # testController, quizController, dashboardController
│   │   ├── routes/   # testRoutes, quizRoutes, dashboardRoutes
│   │   ├── services/ # quizService, scoreService
│   │   ├── middleware/   # errorMiddleware
│   │   └── utils/    # generateCode, normalizeAnswer
│   └── test/         # unit + end-to-end API tests (node:test)
└── frontend/         # React + Vite + Tailwind CSS v4
    └── src/
        ├── pages/    # Home, CreateTest, TestIntro, Quiz, Result, Dashboard, AttemptDetail, NotFound
        ├── components/  # Navbar, Button, ProgressBar, Leaderboard, StatCard, …
        ├── hooks/    # useQuiz
        ├── services/ # api.js (axios client)
        ├── data/     # questionBank.js (30 predefined questions)
        └── utils/    # normalizeAnswer, share (Web Share API)
```

## 🚀 Getting started (local)

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env` from `.env.example` and paste your MongoDB connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/friendship_test?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

**Getting a MongoDB Atlas URI (free):**
1. Sign up at https://www.mongodb.com/atlas and create a free cluster (M0).
2. Under *Network Access*, allow your IP (or `0.0.0.0/0` for dev).
3. Under *Database Access*, create a database user with read/write rights.
4. Click *Connect → Drivers* and copy the connection string into `MONGODB_URI`.

Then run:

```bash
npm run dev        # starts on http://localhost:5000
npm test           # runs unit + integration tests (uses an in-memory MongoDB, no Atlas needed)
```

### 2. Frontend

```bash
cd frontend
npm install
```

`frontend/.env` is already configured for local development:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev        # starts on http://localhost:5173
```

Open http://localhost:5173 → **Create a Test** → pick 15 questions → set answers → share the link
→ take the quiz in another tab → open the dashboard.

## ☁️ Deployment

### Backend → Render (or any Node host)

1. Push the repo to GitHub and create a new **Web Service** in Render pointing at the `backend/` folder.
2. Build command: `npm install` — Start command: `npm start`.
3. Environment variables:

| Variable       | Value                                        |
| -------------- | -------------------------------------------- |
| `PORT`         | `5000` (Render sets this automatically)      |
| `MONGODB_URI`  | your Atlas connection string                 |
| `CLIENT_URL`   | `https://your-frontend.vercel.app`           |
| `JWT_SECRET`   | long random string for signing login tokens  |

### Frontend → Vercel

1. Import the repo in Vercel; set **Root Directory** to `frontend`.
2. Build command: `npm run build` — Output: `dist`.
3. Environment variable:

| Variable          | Value                                    |
| ----------------- | ---------------------------------------- |
| `VITE_API_URL`    | `https://your-backend.onrender.com`      |

> ⚠️ `VITE_*` variables are baked in at build time, so set them before building. Rebuild if the
> backend URL changes.

## 🔌 API reference

Base URL: `http://localhost:5000` (local) — all routes under `/api`.

| Method | Endpoint                                        | Description                                             |
| ------ | ----------------------------------------------- | ------------------------------------------------------- |
| POST   | `/api/auth/register`                            | Create an account `{ username, password }` → `user` + `token` |
| POST   | `/api/auth/login`                               | Log in `{ username, password }` → `user` + `token`     |
| GET    | `/api/auth/me`                                  | Current user (requires `Authorization: Bearer <token>`) |
| POST   | `/api/tests`                                    | Create a test → returns `testCode` + `dashboardToken` (requires login) |
| GET    | `/api/tests`                                    | List your tests (requires login)                       |
| POST   | `/api/tests/claim`                              | Claim a pre-account test via its `dashboardToken` (requires login) |
| GET    | `/api/tests/:testCode`                          | Public test (questions **without** correct answers)     |
| POST   | `/api/tests/:testCode/attempts`                 | Start attempt `{ participantName }` → `attemptId`       |
| POST   | `/api/tests/:testCode/attempts/:attemptId/answer` | Submit `{ questionId, answer, skipped }` → ✅/❌ + correct answer (revealed after answering) |
| POST   | `/api/tests/:testCode/attempts/:attemptId/complete` | Finish the attempt → score, percentage, friendship level, breakdown |
| GET    | `/api/dashboard/:dashboardToken`                | Stats, leaderboard, recent attempts, question analytics |
| GET    | `/api/dashboard/:dashboardToken/attempts/:attemptId` | One friend's full answer breakdown          |

### Security notes

- Correct answers live only on the server. `GET /api/tests/:testCode` strips them, so a curious
  friend can't peek at the network tab.
- Text answers are compared forgivingly: trimmed, lowercased, extra spaces collapsed
  (`"  Manoj "` → `"manoj"`).
- Passwords are hashed with `crypto.scrypt` + a random salt (never stored in plain text).
  Login tokens are HMAC-SHA256 signed with `JWT_SECRET` and expire after 7 days.
- Dashboard access uses a private 16-character token (`/dashboard/9aK73mQ8…`) — keep it secret.
  Only the test owner (or anyone with the token) can view it.
- Tests created before accounts existed can be claimed by their owner via the dashboard token
  on the **My Tests** page.
- Re-submitting the same question is idempotent; completed attempts reject further answers.

## 🧪 Tests

```bash
cd backend && npm test
```

The integration tests spin up an in-memory MongoDB (`mongodb-memory-server`), so they run
without an Atlas cluster. They cover: account registration/login, owner-scoped test lists and
claim-by-token, creating a test, the full quiz flow (correct/wrong/skipped, idempotent
duplicates), completion scoring, dashboard aggregation, leaderboard ranking, attempt detail, and
validation errors.

### Browser E2E smoke test

With both servers running (backend + `npm run dev`), drive the real app in Chrome:

```bash
cd e2e && npm install && npm run smoke
```

It walks the whole journey — Home → sign up → Create Test (15 questions) → share link → My Tests
→ take the quiz → result → dashboard — and writes screenshots to `e2e/screenshots/`. It expects Chrome at
`C:/Program Files/Google/Chrome/Application/chrome.exe` (override with `CHROME_PATH`).

## 🧰 Tech stack

- **Frontend:** React 18, Vite 7, Tailwind CSS v4, React Router 7, Axios, Recharts, react-icons,
  canvas-confetti
- **Backend:** Node.js, Express 4, Mongoose 8, CORS, dotenv, node:test, scrypt + HMAC tokens
  (built-in Node crypto)
- **Database:** MongoDB Atlas (tests use mongodb-memory-server)
- **Optional:** Cloudinary for image questions — the schema already supports `imageUrl` on
  options; add a signed upload endpoint if you want image-based questions.
