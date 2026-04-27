# Inquire

A research organization tool for searching Wikipedia, extracting passages, and structuring knowledge into theories and arguments.

## Prerequisites

- [Docker](https://docker.com) and Docker Compose
- [Bun](https://bun.sh) v1.1+
- Node.js v20+ (for Electron desktop app)

## Quick Start (Web)

```bash
# 1. Start PostgreSQL + Elasticsearch
docker compose up -d

# 2. Install dependencies
bun install

# 3. Start the API server (port 3001)
cd packages/server && bun run dev

# 4. In another terminal, start the frontend (port 3000)
cd packages/client && bun run dev
```

Open http://localhost:3000

## Desktop (Electron)

```bash
cd packages/electron
npm install
npm run dev
```

The Electron app spawns the server automatically and opens a native window.

## Architecture

```
packages/
  shared/    — Shared TypeScript types
  server/    — Hono API server (runs on Bun)
  client/    — React 18 + Vite frontend
  electron/  — Electron desktop shell
```

## Services (Docker Compose)

| Service       | Port |
|---------------|------|
| PostgreSQL    | 5432 |
| Elasticsearch | 9200 |
| Kibana        | 5601 |

## Core Concepts

Everything in Inquire is a **Structure** — a recursive, typed node:

```
Workspace / Collection
  └── Theory        (a thesis or claim)
       └── Argument  (supporting reasoning)
            └── Statement (a specific point)
                 └── Extract  (a quoted passage)
                      └── Text (raw text from a source)
```

Search Wikipedia → select a page → highlight text to create Extracts → organize Extracts into Arguments → build Theories.
