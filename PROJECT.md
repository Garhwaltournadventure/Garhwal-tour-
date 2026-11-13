# Garhwal Tour N Adventure

A static travel website for Uttarakhand tours, rentals, rafting enquiries, and custom trip planning with direct WhatsApp enquiries and Google Reviews links.

## Development

- Install workspace dependencies with pnpm.
- Run the website: `pnpm --filter @workspace/garhwal-tour-adventure run dev`
- Build the website: `pnpm --filter @workspace/garhwal-tour-adventure run build`
- Type-check the website: `pnpm --filter @workspace/garhwal-tour-adventure run typecheck`

## Website

- Main application: `artifacts/garhwal-tour-adventure/src/App.tsx`
- Static assets: `artifacts/garhwal-tour-adventure/public/`
- Production build output: `artifacts/garhwal-tour-adventure/dist/public`

## Services

- Uttarakhand tours and custom route planning
- Car, bike, and scooty rentals
- River rafting enquiries
- Direct WhatsApp contact
- Google Reviews links

## Architecture

The website is built with React, Vite, and Tailwind CSS and is designed for static hosting. Customer enquiries are directed to WhatsApp; the static site does not store enquiry submissions.
