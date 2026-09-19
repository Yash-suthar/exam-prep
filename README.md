# MeritPath

Exam-prep hall for timed mocks with a split-screen question paper and a lock-once OMR sheet. The product is built for SSC, banking, boards, JEE, and NEET — onboarding tags, targeted notices, a Goal page, hall rank, and topic analysis after every paper.

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
| Student (SSC goal + history) | student@meritpath.in | MeritPath@Student1 |
| Peer on the same SSC goal | priya@meritpath.in | MeritPath@Student1 |
| School-track boards | rohan@meritpath.in | MeritPath@Student1 |
| Admin | admin@meritpath.in | MeritPath@Admin1 |

New accounts go through signup → onboarding → goal setup before the home page. Google signup is a demo name/email flow unless real Google OAuth keys are set.

Payments fall back to instant demo checkout when Razorpay / Stripe keys are empty.

## What students get

- Multi-step onboarding (who you are, class, exam tags) and Google continue
- Home: hall stats, 1–2 targeted notices, today’s checklist, weak topics, recommendations
- Goal page: heatmap, momentum, focus deck, score projection, peer leaderboard
- Mock hall: instructions screen, NTA-style palette, mark for review, lock-once OMR
- Scorecard: rank and percentile in this hall, time taken, topic analysis, answer review
- Catalog search, My library tab, invoices/receipts
- Notice board with targeting, schedule, attachments, and a detail page

## GitHub

Repository: https://github.com/Yash-suthar/exam-prep

## Oracle Docker deploy

The app runs on the Oracle VM with Postgres and a Cloudflare quick tunnel.

```bash
ssh -i ~/.ssh/oracle-ubuntu.key ubuntu@144.24.117.17
cd ~/exam-prep
docker compose up -d --build
```

Pushing `main` to GitHub deploys automatically (`.github/workflows/deploy-oracle.yml`).
