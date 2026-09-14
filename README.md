# StudyFlow API

Backend API for StudyFlow, a study dashboard where students set goals, break them into
daily tasks, and track progress.

Built with Express 4, TypeScript (strict), MongoDB + Mongoose, and Zod. Every response
uses the same envelope, and every error uses the same shape, so the API is predictable
for beginner students building against it.

## Stack

- Node.js + Express 4
- TypeScript (strict mode)
- MongoDB with Mongoose
- Zod for request validation
- jsonwebtoken + bcryptjs for auth
- helmet, cors, morgan
- tsx for dev, tsc for build

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable         | Description                                              | Default (dev)                                       |
| ---------------- | ---------------------------------------------------------| ---------------------------------------------------- |
| `PORT`           | Port the server listens on                                | `5000`                                                |
| `MONGODB_URI`    | MongoDB connection string                                 | *required*                                            |
| `JWT_SECRET`     | Secret used to sign JWTs                                  | *required*                                            |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `7d`, `12h`)                              | `7d`                                                  |
| `NODE_ENV`       | `development` \| `production` \| `test`                   | `development`                                         |
| `CORS_ORIGINS`   | Comma-separated list of allowed origins                   | `http://localhost:5173,http://localhost:3000`         |

The app validates all of this with Zod at boot (`src/config/env.ts`) and crashes
immediately with a readable message if anything required is missing — it will never
start half-configured.

### 3. Run in development

```bash
npm run dev
```

Starts the API with `tsx watch` on `http://localhost:5000`.

### 4. Seed demo data

```bash
npm run seed
```

Wipes and recreates a demo user with realistic subjects, tasks, and goals so your
dashboard/charts have real data on first run:

- **Login:** `demo@studyflow.app` / `demo1234`
- 5 subjects (Math, Physics, English, Chemistry, Biology)
- ~21 tasks spread across the last 7 days and the next few, a mix of completed/pending
- 3 goals, each with partial progress

### 5. Build & run for production

```bash
npm run build
npm start
```

### 6. Type-check only

```bash
npm run typecheck
```

## npm scripts

| Script            | What it does                              |
| ----------------- | ------------------------------------------ |
| `npm run dev`      | Start the dev server with hot reload        |
| `npm run build`    | Compile TypeScript to `dist/`               |
| `npm start`        | Run the compiled server (`dist/server.js`)  |
| `npm run seed`     | Wipe and reseed demo data                   |
| `npm run typecheck`| Run `tsc --noEmit`                          |

## Response envelope

Every endpoint returns the same shape.

**Success:**

```json
{ "success": true, "message": "Tasks retrieved successfully", "data": {} }
```

**Success (list endpoints add `meta`):**

```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "meta": { "page": 1, "limit": 20, "total": 42 },
  "data": []
}
```

**Error:**

```json
{
  "success": false,
  "message": "Email already registered",
  "errors": [{ "path": "email", "message": "Email already registered" }]
}
```

`errors` is only present for validation failures. Stack traces are never returned,
and raw Mongoose errors (cast errors, validation errors, duplicate keys) are always
translated into a readable `message`.

## Auth

Send the JWT as `Authorization: Bearer <token>`. Tokens are returned by both
`/api/auth/register` and `/api/auth/login`.

## Endpoints

### Health

| Method | Path           | Auth | Description                     |
| ------ | -------------- | ---- | -------------------------------- |
| GET    | `/`            | No   | Liveness check                   |
| GET    | `/api/health`  | No   | Liveness + DB connection status  |

### Auth (`/api/auth`)

| Method | Path                    | Auth | Body                                         |
| ------ | ----------------------- | ---- | --------------------------------------------- |
| POST   | `/register`             | No   | `{ name, email, password }`                   |
| POST   | `/login`                | No   | `{ email, password }`                         |
| GET    | `/me`                   | Yes  | —                                              |
| PATCH  | `/me`                   | Yes  | `{ name?, dailyGoal?, theme? }`                |
| PATCH  | `/change-password`      | Yes  | `{ oldPassword, newPassword }`                 |

### Tasks (`/api/tasks`) — all require auth

| Method | Path            | Query / Body                                                                  |
| ------ | --------------- | -------------------------------------------------------------------------------|
| GET    | `/`             | `?completed=&priority=&subject=&due=today\|week\|overdue&search=&page=&limit=&sort=` |
| POST   | `/`             | `{ title, subject?, priority?, dueDate?, minutes?, goal? }`                     |
| GET    | `/:id`          | —                                                                                |
| PATCH  | `/:id`          | any subset of create fields + `completed`                                       |
| PATCH  | `/:id/toggle`   | flips `completed`, manages `completedAt`                                        |
| DELETE | `/:id`          | —                                                                                |
| DELETE | `/completed`    | clears all completed tasks                                                      |

### Goals (`/api/goals`) — all require auth

| Method | Path   | Body                                          |
| ------ | ------ | ----------------------------------------------|
| GET    | `/`    | — (includes progress per goal)                |
| POST   | `/`    | `{ title, target, subject?, deadline? }`      |
| GET    | `/:id` | — (includes progress + linked tasks)          |
| PATCH  | `/:id` | any subset of create fields                   |
| DELETE | `/:id` | —                                              |

### Subjects (`/api/subjects`) — all require auth

| Method | Path   | Body                          |
| ------ | ------ | ------------------------------ |
| GET    | `/`    | — (includes taskCount/completedCount) |
| POST   | `/`    | `{ name, color }`               |
| PATCH  | `/:id` | `{ name?, color? }`             |
| DELETE | `/:id` | deletes the subject, sets `subject: null` on its tasks — tasks are never deleted |

### Stats (`/api/stats`) — all require auth

| Method | Path           | Returns                                                  |
| ------ | -------------- | --------------------------------------------------------- |
| GET    | `/overview`    | `{ totalTasks, completed, pending, streak, focusHours }`  |
| GET    | `/weekly`      | Last 7 days: `[{ date, total, completed }]`                |
| GET    | `/by-subject`  | `[{ subject, name, color, total, completed }]`             |

## Behavior notes

- Every task/goal/subject query is scoped to the authenticated user in the **service
  layer** — a valid id belonging to another user returns `404 Not Found`, never `403`
  and never leaks that the resource exists.
- Task list/detail responses populate `subject` with `{ _id, name, color }`.
- `streak` counts consecutive days, ending today, with at least one completed task.
- Deleting a subject never deletes its tasks; it nulls the `subject` field instead.

## Project structure

```
src/
  app.ts                express app, middleware order
  server.ts              db connect + listen
  config/                env validation, db connection
  middleware/             auth, zod validation runner, error handler, 404
  utils/                  ApiError, sendResponse envelope, catchAsync
  modules/
    auth/                 register, login
    user/                  profile (me), change password
    task/                  full CRUD + filters
    goal/                  CRUD + progress
    subject/                CRUD + task counts
    stats/                  overview / weekly / by-subject aggregations
  routes/                  mounts every module under /api
  seed/                    demo data seed script
```

Layering is strict: routes → controller → service → model. Controllers never touch
Mongoose directly, services never touch `req`/`res`.

## Postman

Import `postman_collection.json`. It uses two collection variables:

- `baseUrl` — defaults to `http://localhost:5000`
- `token` — auto-populated by a test script on **Register** and **Login**, so every
  other request in the collection works immediately after you run either one.
