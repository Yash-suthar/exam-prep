# MeritPath

Exam-prep platform for timed mocks with a split-screen question paper and a lock-once OMR sheet. First slice covers auth, catalog, demo checkout, library, notices, admin exam builder, and the exam-taking / results flow.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL · Auth.js · shadcn-style Radix primitives · Framer Motion · react-pdf

## Local setup

PostgreSQL must be running. Create the database once:

```bash
createdb exam_prep
```

Then:

```bash
cp .env.example .env
# set DATABASE_URL and AUTH_SECRET
npm install
npm run db:setup
npm run dev
```

The app listens on [http://127.0.0.1:43147](http://127.0.0.1:43147).

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Student | student@meritpath.in | MeritPath@Student1 |
| Admin | admin@meritpath.in | MeritPath@Admin1 |

Payments fall back to instant demo checkout when Razorpay / Stripe keys are empty. Live keys can be added later in `.env`.

## What this slice includes

- Marketing landing, login, register
- Role-based routes (`USER` / `ADMIN`) via Auth.js JWT + `proxy.ts`
- Catalog (books, materials, papers), My Library, notice board, profile / purchase history
- `hasAccess()` on the server; PDFs served only through short-lived signed URLs
- Timed exam room: PDF + OMR, confirmation before locking a bubble, auto-submit, server-side negative marking
- Result + review filters
- Admin overview, users (grant / suspend), content list, exam builder, notices, analytics

## GitHub

Repository: https://github.com/Yash-suthar/exam-prep

## Oracle Docker deploy

The app runs on the Oracle VM with Postgres and a Cloudflare quick tunnel.

```bash
# first-time secrets live in ~/exam-prep/.env on the host
ssh -i ~/.ssh/oracle-ubuntu.key ubuntu@144.24.117.17
cd ~/exam-prep
docker compose up -d --build
```

Pushing `main` to GitHub deploys automatically (`.github/workflows/deploy-oracle.yml`). The workflow SSHs in, pulls, and rebuilds `app` + `db` so the tunnel URL stays put.

Required GitHub secrets: `ORACLE_HOST`, `ORACLE_USER`, `ORACLE_SSH_KEY`.
