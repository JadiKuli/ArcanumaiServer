FROM node:20-bullseye AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma generate
RUN pnpm build


FROM node:20-bullseye AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y \
    blender python3-pip curl \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml* ./pnpm-lock.yaml
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma

RUN corepack enable && corepack prepare pnpm@latest --activate \
 && pnpm install --prod --frozen-lockfile

COPY render_thumb.py /opt/render/render.py
ENV BLENDER_PY=/opt/render/render.py

EXPOSE 3000
CMD ["node", "dist/main.js"]
