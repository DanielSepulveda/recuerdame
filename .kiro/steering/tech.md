# Technology Stack

## Core Framework

- **Next.js 15.5.4** - React framework with App Router
- **React 19** - Frontend UI library
- **TypeScript 5** - Type-safe JavaScript

## Backend & Database

- **Convex** - Real-time backend with database, server functions, and file storage
- **Clerk** - Authentication and user management
- Functions located in `src/convex/` directory

## Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library
- **next-themes** - Dark/light theme support

## Development Tools

- **ESLint** - Code linting with Next.js and Convex plugins
- **Prettier** - Code formatting
- **npm-run-all2** - Run multiple scripts in parallel

## Common Commands

```bash
# Development (runs frontend and backend in parallel)
npm run dev

# Frontend only
npm run dev:frontend

# Backend only (Convex)
npm run dev:backend

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Setup

- Requires `.env.local` for environment variables
- Convex deployment configuration in `convex.json`
- Authentication setup through Clerk dashboard

## Key Dependencies

- Form handling: `react-hook-form` + `@hookform/resolvers` + `zod`
- Date utilities: `date-fns`
- Carousel: `embla-carousel-react`
- Charts: `recharts`
- Notifications: `sonner`
