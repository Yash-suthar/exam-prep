FROM node:22-bookworm-slim
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN mkdir -p public && npm ci

COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN mkdir -p /app/uploads && chmod +x /app/scripts/entrypoint.sh
EXPOSE 3000
CMD ["/app/scripts/entrypoint.sh"]
