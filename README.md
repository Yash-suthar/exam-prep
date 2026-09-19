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

With the dev server running, `npm run e2e` drives a real browser through signup, onboarding, goal setup, the study timer, the syllabus board, the admin exam builder, the mobile exam hall, and password reset.

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

## The goal system (the differentiator)

Picking a goal loads the real syllabus for that exam, then tracks you against it.

- **Today** — daily minutes vs target, checklist, study timer, what to study next, milestones
- **Syllabus** — standard SSC / banking / JEE / NEET / boards / UPSC / railways / CAT / teaching / defence templates, each topic cycling Not started → Learning → Revising → Mastered
- **Progress** — hours logged, consistency grid, subject coverage, score projection, session history
- **Peers** — ranked against everyone chasing the same exam on momentum and recent mocks
- **Settings** — targets, daily minutes, mocks per week, rest days, checklist edits, archive and switch goals

Supporting mechanics: a readiness score out of 100 (syllabus coverage, mock accuracy, weekly minutes, streak), a required pace like "2 topics a day", a revision queue for topics gone stale, and rest days that keep a streak alive on days you planned to skip.

## What students get

- Multi-step onboarding (who you are, class, exam tags) and Google continue
- Home: goal strip, hall stats, targeted notices, today’s checklist, weak topics, recommendations
- Mock hall: instructions screen, NTA-style palette, mark for review, lock-once OMR
- Scorecard: rank and percentile in this hall, time taken, topic analysis, answer review
- Catalog search, My library tab, invoices/receipts
- Notice board with targeting, schedule, attachments, and a detail page
- Self-serve password reset (link is shown on screen — no mail provider is configured)

## What admins get

Nothing here needs another screen finished first.

- Upload PDFs by drag-and-drop anywhere a file is needed (books, materials, papers, exam papers, notice attachments)
- Add a subject inline from any form that asks for one
- Exam builder in five steps: paper, marking, answer key (paste the whole key at once, tag topics), audience targeting, publish or save as draft
- Content, notices, subjects, exams, and users all support create, edit, and delete

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
