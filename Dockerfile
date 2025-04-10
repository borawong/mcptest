FROM python:3.12-slim-bookworm AS base

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm && \
    pnpm config set store-dir /pnpm-store

ARG REQUEST_TIMEOUT=120000
ENV REQUEST_TIMEOUT=$REQUEST_TIMEOUT
ENV NODE_ENV=production

RUN uv tool install mcp-server-fetch

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

RUN pnpm add -E \
    @amap/amap-maps-mcp-server \
    @playwright/mcp@latest \
    tavily-mcp@latest \
    @modelcontextprotocol/server-github \
    @modelcontextprotocol/server-slack

COPY . .

RUN pnpm install --frozen-lockfile && \
    pnpm frontend:build && \
    pnpm build && \
    pnpm prune --prod

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["pnpm", "start"]
