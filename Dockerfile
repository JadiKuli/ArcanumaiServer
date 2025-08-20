FROM node:20-bullseye AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma generate
RUN pnpm build

FROM node:20-bullseye-slim AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl ca-certificates python3 \
    libxkbcommon0 libgl1 libxi6 libxxf86vm1 libxrender1 libxfixes3 libxext6 libxau6 libxdmcp6 libsm6 libice6 \
    xz-utils \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV BLENDER_VERSION=4.2.3
RUN curl -L https://download.blender.org/release/Blender${BLENDER_VERSION%.*}/blender-${BLENDER_VERSION}-linux-x64.tar.xz \
    | tar -xJ --strip-components=1 -C /opt \
    && ln -s /opt/blender /usr/local/bin/blender

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml* ./pnpm-lock.yaml
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/storage ./storage

RUN corepack enable && corepack prepare pnpm@latest --activate \
    && pnpm install --prod --frozen-lockfile

COPY render_thumb.py /opt/render/render.py
ENV BLENDER_PY=/opt/render/render.py

EXPOSE 3000
CMD ["node", "dist/main.js"]
