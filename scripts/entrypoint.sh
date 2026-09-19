#!/bin/sh
set -eu

npx prisma db push --skip-generate

if [ ! -f /app/uploads/.seeded ]; then
  npx tsx prisma/seed.ts
  touch /app/uploads/.seeded
fi

exec npx next start -H 0.0.0.0 -p 3000
