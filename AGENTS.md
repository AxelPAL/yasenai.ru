# ЯсеньИИ Frontend — Agent Instructions

This document provides all essential context for AI agents working on this codebase.

## Project Overview

**ЯсеньИИ** is a Next.js 16 frontend application serving as a **Backend for Frontend (BFF)** layer over the `ai-chat-bot` Go API. It provides a clean, minimalist chat interface with dark/light theme support and an ash tree (ясень) visual identity.

## Architecture

### BFF Pattern
All communication with the `ai-chat-bot` backend happens exclusively in **Next.js Route Handlers** (API routes). The frontend React components **never** call the backend directly.

```
Browser (React Client Components)
    ↕ fetch /api/*
Next.js API Routes (Route Handlers)  ← BFF layer
    ↕ fetch with Bearer token
ai-chat-bot Go backend (http://localhost:8080/api/v1)
```

### Session Strategy
- **No user registration/login** in this frontend
- A single system user's credentials live in `AI_CHAT_BOT_EMAIL` / `AI_CHAT_BOT_PASSWORD` env vars
- JWT tokens are obtained via `src/lib/token-cache.ts` — cached in server memory, auto-refreshed on 401
- **iron-session** (`src/lib/session.ts`) provides encrypted HTTP-only session cookies
- Sessions track `chatIds[]` — which backend chats belong to this browser session

### Data Security
- **No sensitive data crosses to the client** — tokens, credentials, model IDs are server-only
- `AI_MODEL_ID` env var (no `NEXT_PUBLIC_` prefix) → stays server-side
- `SESSION_SECRET` is used to encrypt session cookies

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chats/
│   │   │   ├── route.ts          # GET (list), POST (create) — filters by session chatIds
│   │   │   └── [id]/route.ts     # DELETE, PATCH — validates chat ownership via session
│   │   ├── text/stream/route.ts  # POST — SSE streaming proxy, captures new chat_id into session
│   │   └── messages/[id]/route.ts # DELETE message
│   ├── chat/
│   │   ├── layout.tsx            # Mounts ChatLayout (sidebar + main area)
│   │   ├── page.tsx              # New chat page — shows ChatWindow with chat=null
│   │   └── [chatId]/
│   │       ├── page.tsx          # Server component — validates session, fetches chat
│   │       └── ChatWindowWrapper.tsx  # Client boundary
│   ├── layout.tsx                # Root layout with ThemeProvider
│   ├── globals.css               # Tailwind v4 config + custom forest color palette
│   └── page.tsx                  # Redirects to /chat
├── components/
│   ├── chat/
│   │   ├── ChatLayout.tsx        # Client component — wraps sidebar + main content
│   │   ├── ChatSidebar.tsx       # Sidebar: ash tree logo, chat list, theme toggle
│   │   ├── ChatWindow.tsx        # Message list + input, handles streaming state
│   │   ├── ChatInput.tsx         # Textarea with send/stop button
│   │   ├── MessageBubble.tsx     # User/assistant message with Markdown rendering
│   │   └── EmptyChat.tsx         # Empty state with ash tree illustration
│   ├── ui/
│   │   ├── AshTree.tsx           # SVG ash tree illustration (brand identity)
│   │   ├── ThemeToggle.tsx       # Light/dark toggle button
│   │   └── Spinner.tsx           # Loading spinner
│   └── providers/
│       └── ThemeProvider.tsx     # next-themes provider wrapper
├── hooks/
│   ├── useChats.ts               # Fetch/create/delete/rename chats via /api/chats
│   └── useStreamMessage.ts       # SSE streaming — reads /api/text/stream, fires onMessageComplete
└── lib/
    ├── api-client.ts             # Server-only: all calls to ai-chat-bot backend
    ├── token-cache.ts            # Server-only: in-memory JWT token cache
    ├── session.ts                # iron-session config and SessionData type
    └── types.ts                  # Shared TypeScript types (Chat, Message, StreamEvent, etc.)
```

## Key Implementation Details

### Streaming (SSE)
- `POST /api/text/stream` proxies Server-Sent Events from the backend
- For **new chats** (no `chat_id` in request): the proxy intercepts the `start` event, extracts `chat_id`, and saves it to the iron-session — this links the new chat to the browser session
- For **existing chats**: stream is piped directly to the client
- Client-side: `useStreamMessage` hook reads the SSE stream and updates React state chunk-by-chunk

### Chat Ownership
- `GET /api/chats` returns only chats whose IDs are in `session.chatIds`
- `DELETE/PATCH /api/chats/[id]` checks that the chat ID is in the session before proceeding
- `GET /chat/[chatId]` (server page) checks session before rendering — returns 404 otherwise

### Token Refresh
- `token-cache.ts` holds the JWT in memory with a 23-hour TTL
- On 401 from any API call, the token is invalidated and a fresh login is performed automatically

## Environment Variables

All variables are **server-side only** (no `NEXT_PUBLIC_` prefix):

| Variable | Description | Example |
|---|---|---|
| `AI_CHAT_BOT_API_URL` | Backend base URL | `http://localhost:8080/api/v1` |
| `AI_CHAT_BOT_EMAIL` | System user email | `system@example.com` |
| `AI_CHAT_BOT_PASSWORD` | System user password | `strong-password` |
| `AI_MODEL_ID` | **Integer** DB ID of the model (field `id` from `GET /models/to-show`, NOT the string `model_id`) | `2931` |
| `SESSION_SECRET` | iron-session encryption key (≥32 chars) | `random-32-char-string` |

Copy `.env.example` to `.env.local` and fill in the values.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | Framework |
| TypeScript | Language |
| Tailwind CSS v4 | Styling |
| `@tailwindcss/typography` | Markdown prose styling |
| `next-themes` | Dark/light theme |
| `iron-session` | Encrypted session cookies |
| `react-markdown` + `remark-gfm` | Markdown rendering in messages |
| `lucide-react` | Icons |
| `uuid` | Session ID generation |

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Design System

### Colors
Custom `forest` palette (defined in `globals.css` `@theme`):
- `forest-600` (#3d6b3f) — primary accent, user message bubbles, buttons
- `forest-400/500` — lighter shades, foliage in AshTree SVG

### Theme
- Light: white/stone backgrounds, forest-600 accent
- Dark: stone-900/950 backgrounds, forest-500 accent
- Controlled via `ThemeProvider` (next-themes, `class` strategy)

### Visual Identity
- `AshTree` SVG component is used in the sidebar header and empty state
- Minimalist, clean layout — single-column message thread, collapsible sidebar

## Adding New Features

### New API Route (BFF endpoint)
1. Create `src/app/api/<resource>/route.ts`
2. Import from `src/lib/api-client.ts` for backend calls
3. Use `getIronSession` from `iron-session` for session access
4. Never import `api-client.ts` from client components

### New Backend API Method
1. Add a function to `src/lib/api-client.ts`
2. Use `apiFetch<T>()` helper (handles auth + retry)
3. Export the function for use in Route Handlers

### New UI Component
- Place in `src/components/chat/` (chat-specific) or `src/components/ui/` (generic)
- Use `"use client"` directive only when needed (hooks, event handlers, browser APIs)
- Prefer Server Components for data-fetching wrappers

## Backend API Reference

The `ai-chat-bot` backend is documented in `C:\Users\AxelPAL\GolandProjects\ai-chat-bot\api\web.yaml` (OpenAPI 3.0).

Key endpoints used by this frontend:
- `POST /login` — obtain JWT token
- `GET /chats` — list all chats for the system user
- `POST /chats` — create a new chat (requires `title`, `model_id`)
- `DELETE /chats/{id}` — delete a chat
- `PATCH /chats/{id}` — update chat title/context_size
- `POST /text/stream` — streaming SSE text generation
- `DELETE /message/{id}` — nullify message content

The `model_id` field in `POST /chats` and `POST /text/stream` is always set from `AI_MODEL_ID` env var.
