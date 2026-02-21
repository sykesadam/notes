# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Build for production
npm run start        # Run production build (.output/server/index.mjs)
npm run test         # Run tests with Vitest
npm run typecheck    # TypeScript type check (no emit)
npm run check        # Biome lint + format check
npm run format:write # Auto-fix formatting with Biome
npm run lint         # Biome lint only
```

Add shadcn components:
```bash
pnpx shadcn@latest add <component>
```

## Architecture

**Stack**: TanStack Start (SSR) + TanStack Router (file-based) + TanStack Query + React 19 + Vite + Tailwind CSS v4 + Biome + Vitest

**Path alias**: `@/*` → `./src/*`

### Data Layer

The app uses a **local-first, offline-capable** architecture with two databases:

- **Remote**: Postgres via Drizzle ORM (`src/lib/db/remote/`) — schema for `users`, `sessions`, `accounts`, `verifications`, `notes`
- **Local**: IndexedDB via `idb` library (`src/lib/db/local/notes.ts`) — stores `notes`, `outbox`, `metadata` object stores
- **Adapters** (`src/lib/db/adapters.ts`): Convert between `RemoteNote` (Drizzle/Postgres with `Date` timestamps) and `LocalNote` (IndexedDB with Unix millisecond timestamps)

**Sync** (`src/lib/db/sync.ts`): Uses an **outbox pattern** with **Last-Write-Wins (LWW)** conflict resolution. All mutations write to IndexedDB and queue an outbox entry. A background sync (every 2 minutes, on focus/reconnect) pushes outbox items to the server and pulls remote changes.

### Routing & Auth

- `src/routes/` — file-based TanStack Router routes
- `src/routes/__root.tsx` — root layout; runs `hydrateNotesFromDB` on client load and resolves session/sidebar/theme state before rendering
- `src/routes/_authed/` — protected layout route; wraps authenticated pages
- `src/routes/api/auth/$.ts` — better-auth API catch-all handler
- Auth uses **better-auth** with email/password enabled, Drizzle adapter, and `reactStartCookies` plugin

### Server Functions

- `createServerFn` (TanStack Start) — RPC-style server functions, used for the sync endpoint in `src/lib/db/sync.ts`
- `createIsomorphicFn` — functions that run on both client and server (session, sidebar state, theme); defined in `src/functions.ts`
- `authMiddleware` in `src/lib/db/sync.ts` validates sessions server-side before sync

### State / Query

All note CRUD operations and background sync are managed through TanStack Query options defined in `src/lib/query-options.ts`. The query cache is pre-populated from IndexedDB on startup via `hydrateNotesFromDB` (`src/lib/hydrateAppState.ts`).

### Editor

The rich text editor (`src/components/editor/editor.tsx`) uses **Lexical** with plugins for rich text, lists, links, tables, code, markdown shortcuts, and auto-links. Editor state is stored as serialized JSON.

### Environment Variables

Typed via T3Env (`src/env.ts`). Client variables must be prefixed with `VITE_`. Currently only `VITE_URL` is declared.

### UI Components

Shadcn (new-york style, zinc base color, CSS variables) with Radix UI primitives and lucide-react icons. Components live in `src/components/ui/`.
