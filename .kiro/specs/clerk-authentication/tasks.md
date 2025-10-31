# Implementation Plan

- [x] 1. Create authentication modal context and provider
  - Create AuthModalContext with ModalType enum and state management functions
  - Implement AuthModalProvider component with useState for modal state
  - Export useAuthModal hook for consuming the context
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 2. Create authentication modal components
- [x] 2.1 Create SignInModal component
  - Build modal dialog using shadcn/ui Dialog component
  - Integrate Clerk's SignIn component with Spanish localization
  - Style modal to match Day of the Dead theme colors
  - Handle successful sign-in by closing modal and redirecting to /app
  - _Requirements: 2.1, 2.2, 3.1, 3.3_

- [x] 2.2 Create SignUpModal component
  - Build modal dialog using shadcn/ui Dialog component
  - Integrate Clerk's SignUp component with Spanish localization
  - Style modal to match Day of the Dead theme colors
  - Handle successful sign-up by closing modal and redirecting to /app
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.3_

- [ ] 3. Update middleware for proper route protection
  - Modify middleware to redirect unauthenticated users from /app routes to landing page
  - Ensure existing subdomain handling and other protected routes remain functional
  - Test that authenticated users can access /app routes without issues
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 4. Create authentication-aware call-to-action components
- [x] 4.1 Create UnauthenticatedCallToAction component
  - Replace existing CTA buttons with modal-triggering buttons
  - Implement "Crear Mi Altar" button that opens SignUp modal
  - Add "Iniciar Sesión" button that opens SignIn modal
  - Maintain existing visual design and Day of the Dead styling
  - _Requirements: 5.1, 5.3, 5.4_

- [ ] 4.2 Create AuthenticatedCallToAction component
  - Create "Ir a Mis Altares" button that navigates to /app
  - Display user greeting with first name from Clerk user data
  - Style consistently with existing design system
  - _Requirements: 5.2_

- [ ] 5. Update landing page to use authentication-aware components
  - Integrate AuthModalProvider at the root level of the landing page
  - Replace existing CallToAction component with conditional rendering
  - Use Clerk's SignedIn/SignedOut components to show appropriate CTAs
  - Ensure modals are rendered and accessible from landing page
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6. Add authentication modal integration to app layout
  - Wrap the app layout with AuthModalProvider for modal access throughout app
  - Ensure modals work consistently across all pages
  - Test modal functionality from different parts of the application
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 7. Style and customize Clerk components for cultural theming
  - Configure Clerk appearance props to match Day of the Dead color scheme
  - Ensure Spanish localization is properly applied to all Clerk components
  - Test modal styling across different screen sizes and devices
  - Verify accessibility and keyboard navigation work properly
  - _Requirements: 3.1, 3.2, 3.3_
