# Tabla Academy

End-to-end web app for online tabla instruction: course catalog, live sessions, payments, lecture
summaries, content uploads, attendance, and an AI practice assistant.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- PostgreSQL + Prisma
- NextAuth (credentials, role-based: STUDENT / TEACHER)
- Razorpay (payments)
- Claude API (AI practice feedback)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Postgres: this repo was developed against a local Postgres installed via Homebrew
   (`brew install postgresql@16`, `brew services start postgresql@16`, then
   `createdb tabla_app`). Point `DATABASE_URL` at any Postgres instance.

3. Copy `.env.example` to `.env` and fill in the values (see below).

4. Run migrations and generate the client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

## Environment variables

| Variable | Required for | Notes |
|---|---|---|
| `DATABASE_URL` | everything | Postgres connection string |
| `NEXTAUTH_SECRET` | auth | any random string in dev |
| `NEXTAUTH_URL` | auth | `http://localhost:3000` in dev |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | payments | from the Razorpay dashboard; enroll button fails without these |
| `ANTHROPIC_API_KEY` | AI practice assistant | from console.anthropic.com; practice feedback fails without this |

## Modules

- **Auth** — `/login`, `/signup`. Role selected at signup.
- **Courses** — `/courses` (public list), `/courses/[id]` (detail + enroll).
- **Teacher dashboard** — `/teacher`, `/teacher/courses/new`, `/teacher/courses/[id]`
  (schedule sessions, write lecture summaries, mark attendance, upload content).
- **Student dashboard** — `/student` (enrolled courses, upcoming sessions, attendance history),
  `/student/practice` (AI practice assistant).
- **Payments** — Razorpay checkout on the course detail page; verified server-side via
  `/api/payments/verify` before creating an enrollment.
- **Live sessions** — session = a title + external meeting link (Zoom/Google Meet) + datetime,
  not an in-app video call.

## Known limitations / next steps

- File uploads (course content, practice recordings) are written to `public/uploads` on local
  disk. Fine for development; swap for S3 or another blob store before deploying anywhere with
  ephemeral or multi-instance filesystems.
- The AI practice assistant gives feedback based on metadata you provide (taal, target tempo,
  notes) — it does not currently perform audio/rhythm analysis on the uploaded recording itself,
  since the Claude API doesn't accept audio input. A future iteration could add a tempo/onset
  detection step (e.g. with a DSP library) and feed those derived metrics into the prompt.
- No password reset flow yet.
- Razorpay webhook for async payment events isn't implemented; verification currently happens
  only on the client-driven `verify` call after checkout.
