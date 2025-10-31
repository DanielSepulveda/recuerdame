# Project Structure

## Root Directory

```
├── src/                    # Source code
├── public/                 # Static assets
├── .kiro/                  # Kiro configuration and steering
├── .next/                  # Next.js build output
├── node_modules/           # Dependencies
└── convex.json            # Convex configuration
```

## Source Structure (`src/`)

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── server/            # Server-side pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Hero.tsx          # Landing page hero
│   ├── Features.tsx      # Features section
│   └── CallToAction.tsx  # CTA section
├── convex/               # Convex backend functions
│   ├── _generated/       # Auto-generated Convex files
│   ├── auth.config.ts    # Authentication configuration
│   ├── myFunctions.ts    # Custom Convex functions
│   └── schema.ts         # Database schema
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   └── utils.ts          # Common utilities
└── middleware.ts         # Next.js middleware
```

## Key Conventions

### File Naming

- React components: PascalCase (e.g., `Hero.tsx`, `CallToAction.tsx`)
- Utility files: camelCase (e.g., `utils.ts`, `myFunctions.ts`)
- Configuration files: kebab-case or standard names

### Component Organization

- UI components in `src/components/ui/` (shadcn/ui)
- Feature components in `src/components/` root
- Page components in `src/app/` following App Router structure

### Convex Backend

- Functions in `src/convex/` directory
- Schema definition in `schema.ts`
- Authentication config in `auth.config.ts`
- Generated types in `_generated/` (do not edit)

### Styling

- Global styles in `src/app/globals.css`
- Component-level styles using Tailwind classes
- Custom CSS variables for theming

### Assets

- Images and static files in `public/`
- Favicon and app icons included
- Hero background image: `public/hero-altar.jpg`

## Import Patterns

- Use `@/` alias for `src/` directory imports
- Import UI components from `@/components/ui/`
- Import Convex functions from generated API files
