# Garhwal Tour N Adventure

A static travel website for Uttarakhand tours, rentals, rafting, and custom trip planning with direct WhatsApp enquiries and Google Reviews links.

## Run & Operate

- `pnpm --filter @workspace/garhwal-tour-adventure run dev` — run the Vite preview
- `pnpm --filter @workspace/garhwal-tour-adventure run build` — create the static site in `dist/public`
- `pnpm --filter @workspace/garhwal-tour-adventure run typecheck` — typecheck the frontend

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- React, Vite, and Tailwind CSS
- Static hosting with no server or database dependency

## Where things live

- `artifacts/garhwal-tour-adventure/src/App.tsx` — site content and page layout
- `artifacts/garhwal-tour-adventure/public/` — images and static assets
- `artifacts/garhwal-tour-adventure/.replit-artifact/artifact.toml` — static production build configuration

## Architecture decisions

- All enquiries open WhatsApp directly; no form submissions are stored.
- Reviews link directly to Google Maps; no review data is stored locally.
- The production artifact serves the Vite build as static files.

## Product

- Uttarakhand tours and custom route planning
- Car, bike, and scooty rentals
- River rafting enquiries
- Direct WhatsApp contact
- Read and leave Google Reviews

## User preferences

_None recorded._

## Gotchas

- Keep the production service configured as `serve = "static"` in the artifact manifest.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
