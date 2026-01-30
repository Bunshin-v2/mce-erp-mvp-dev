# CLAUDE.md - MCE Command Center 2026 Design System

**Authority:** Principal Systems Architect
**Status:** Active Governance Framework
**Last Updated:** 2026-01-30

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server (Turbopack)
npm run dev

# Clean start (Kill ports, clear .next)
npm run dev:fresh

# Build for production
npm run build
```

The dev server runs on `http://localhost:3000`. The application uses Next.js 16 (Turbopack) and TypeScript.

## Architecture Overview

### High-Level Structure

This is a Next.js App Router project using Turbopack. 

**Structure:**
- `app/`: Routing and Layouts (Standard Next.js)
- `components/`: UI and Business components
- `hooks/`: Custom React hooks
- `lib/`: Shared utilities and service clients (Supabase, Clerk, AI)
- `styles/`: CSS variables and Design Tokens

**Key Configs:**
- `next.config.mjs`: Next.js configuration
- `tailwind.config.ts`: Tailwind configuration
- `postcss.config.mjs`: PostCSS configuration
- `tsconfig.json`: TypeScript configuration with `@/*` aliases

## Key Development Patterns

### Real-time Data Updates
The dashboard uses Supabase's real-time subscriptions via the `useDashboardData` hook. Changes to tracked tables automatically trigger UI updates.

### Design System (2026)
All styling must use the semantic tokens defined in `styles/tokens-2026.css` via Tailwind classes. Hardcoded hex values are strictly forbidden.

### Authentication
Integrated via Clerk. Public routes and API endpoints are matched in `proxy.ts` (if active) and guarded via `RouteGuard` or client-side checks.
