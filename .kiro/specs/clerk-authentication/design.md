# Design Document

## Overview

This design implements a complete Clerk authentication system for the Recuerdame app using Clerk's built-in components displayed in modal dialogs. The solution leverages Clerk's `SignInButton` and `SignUpButton` components in modal mode to provide seamless authentication flows without requiring separate pages. The design maintains the existing Spanish localization and Day of the Dead cultural theming while ensuring protected routes redirect unauthenticated users to the landing page.

## Architecture

### Authentication Flow Architecture

```mermaid
graph TD
    A[Landing Page] --> B{User Authenticated?}
    B -->|No| C[Show Sign Up CTA]
    B -->|Yes| D[Show Go to App CTA]

    C --> E[User Clicks "Crear Mi Altar"]
    E --> F[Open SignUp Modal]
    F --> G[Clerk SignUp Component]
    G --> H{Sign Up Success?}
    H -->|Yes| I[Redirect to /app]
    H -->|No| J[Show Error in Modal]

    K[User Tries /app Route] --> L{Authenticated?}
    L -->|No| M[Redirect to Landing]
    L -->|Yes| N[Allow Access]

    O[User Needs Sign In] --> P[Open SignIn Modal]
    P --> Q[Clerk SignIn Component]
    Q --> R{Sign In Success?}
    R -->|Yes| I
    R -->|No| S[Show Error in Modal]
```

### Component Architecture

The authentication system consists of:

1. **Modal Management**: Custom React context for managing authentication modal state
2. **Authentication Buttons**: Wrapper components that trigger modals
3. **Modal Components**: Dialog containers for Clerk's SignIn/SignUp components
4. **Route Protection**: Enhanced middleware for redirecting unauthenticated users
5. **Landing Page Integration**: Updated CTAs based on authentication state

## Components and Interfaces

### 1. Authentication Modal Context

```typescript
type ModalType = "sign-in" | "sign-up" | null;

interface AuthModalContextType {
  openModalType: ModalType;
  openSignIn: () => void;
  openSignUp: () => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined,
);
```

### 2. Authentication Modal Components

#### SignInModal Component

- Uses shadcn/ui Dialog component as container
- Renders Clerk's SignIn component with Spanish localization
- Handles successful authentication by closing modal and redirecting
- Styled to match Day of the Dead theme

#### SignUpModal Component

- Uses shadcn/ui Dialog component as container
- Renders Clerk's SignUp component with Spanish localization
- Handles successful authentication by closing modal and redirecting
- Styled to match Day of the Dead theme

### 3. Enhanced Call-to-Action Components

#### AuthenticatedCallToAction

- Displays "Ir a Mis Altares" button for authenticated users
- Shows user greeting with first name
- Links directly to /app dashboard

#### UnauthenticatedCallToAction

- Displays "Crear Mi Altar" button that opens SignUp modal
- Displays "Iniciar Sesión" button that opens SignIn modal
- Maintains existing visual design

### 4. Route Protection Enhancement

Enhanced middleware configuration:

- Redirects unauthenticated users from `/app/*` routes to landing page
- Maintains existing subdomain handling
- Preserves protection for other routes

## Data Models

### Authentication State Management

The authentication state is managed by Clerk's built-in hooks and context:

```typescript
// From @clerk/nextjs
interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: EmailAddress[];
  imageUrl: string;
}

interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: User | null;
}
```

### Modal State Management

```typescript
type ModalType = "sign-in" | "sign-up" | null;

interface ModalState {
  openModalType: ModalType;
}
```

## Error Handling

### Authentication Errors

- Clerk components handle validation and authentication errors internally
- Spanish localization ensures error messages are culturally appropriate
- Modal remains open on errors to allow user correction

### Route Protection Errors

- Unauthenticated access to protected routes results in redirect to landing page
- No error messages needed as this is expected behavior
- Smooth user experience maintained

### Network Errors

- Clerk handles network connectivity issues
- Loading states managed by Clerk components
- Graceful degradation for offline scenarios

## Implementation Notes

### Clerk Configuration

- Existing ClerkProvider configuration with Spanish localization (esMX) will be maintained
- Modal components will inherit the localization settings
- Appearance customization will match the Day of the Dead theme

### Styling Integration

- Use existing Tailwind CSS classes for consistency
- Apply Day of the Dead color scheme to modal containers
- Ensure Clerk components blend with app design through appearance props

### Performance Considerations

- Modals are rendered conditionally to avoid unnecessary DOM elements
- Clerk components are lazy-loaded when modals open
- Authentication state is cached by Clerk for optimal performance

### Accessibility

- Modal dialogs follow ARIA guidelines through shadcn/ui Dialog
- Keyboard navigation supported
- Screen reader compatibility maintained
- Focus management handled by Dialog component
