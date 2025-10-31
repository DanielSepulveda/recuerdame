# Implementation Plan

- [x] 1. Update Convex schema with core altar tables
  - Replace the existing sample schema in `src/convex/schema.ts` with the three main tables: altars, collaborators, and altar_shares
  - Add proper field validations and indexes as specified in the design
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Create altar management functions
  - [x] 2.1 Implement altar creation function
    - Write Convex mutation to create new altars with generated tldraw room IDs
    - Include validation for required fields and owner authentication
    - _Requirements: 1.1, 4.1, 4.4_

  - [x] 2.2 Implement altar query functions
    - Write Convex query to fetch altars by owner ID
    - Write Convex query to fetch altar details by ID with permission checks
    - _Requirements: 1.3_

  - [x] 2.3 Implement altar update and deletion functions
    - Write Convex mutation to update altar metadata
    - Write Convex mutation to delete altars with proper cleanup of related records
    - _Requirements: 1.4, 1.5_

- [ ] 3. Create collaboration management functions
  - [ ] 3.1 Implement collaborator invitation system
    - Write Convex mutation to add collaborators with role assignment
    - Include validation to prevent duplicate collaborators
    - _Requirements: 3.1, 3.2_

  - [ ] 3.2 Implement collaborator query functions
    - Write Convex query to fetch collaborators for an altar
    - Write Convex query to fetch altars where user is a collaborator
    - _Requirements: 3.3_

  - [ ] 3.3 Implement collaborator management functions
    - Write Convex mutation to update collaborator roles
    - Write Convex mutation to remove collaborators
    - Write Convex mutation to update collaborator activity timestamps
    - _Requirements: 3.4, 3.5, 3.6_

- [ ] 4. Create public sharing system
  - [ ] 4.1 Implement share creation functions
    - Write Convex mutation to create public shares with unique slug generation
    - Include validation to prevent duplicate share slugs
    - _Requirements: 2.1, 2.4_

  - [ ] 4.2 Implement share query functions
    - Write Convex query to fetch altar by share slug for public access
    - Write Convex query to check if altar is publicly shared
    - _Requirements: 2.3_

  - [ ] 4.3 Implement share management functions
    - Write Convex mutation to disable/remove public shares
    - Write Convex mutation to update view counts and timestamps
    - _Requirements: 2.4, 2.5_

- [ ] 5. Create access control and permission functions
  - [ ] 5.1 Implement permission checking utilities
    - Write helper functions to verify altar ownership
    - Write helper functions to verify collaborator permissions
    - Write helper functions to check public access rights
    - _Requirements: 3.4, 3.5, 3.6_

  - [ ] 5.2 Implement tldraw integration helpers
    - Write functions to generate unique tldraw room IDs
    - Write functions to validate tldraw room access based on altar permissions
    - _Requirements: 4.1, 4.4, 4.5_

- [ ] 6. Create data cleanup and maintenance functions
  - [ ] 6.1 Implement cascading deletion functions
    - Write functions to clean up collaborators when altars are deleted
    - Write functions to clean up shares when altars are deleted
    - _Requirements: 1.4, 1.5_

  - [ ] 6.2 Implement data validation functions
    - Write functions to validate Clerk user ID references
    - Write functions to ensure data integrity across related tables
    - _Requirements: 3.1, 3.2_

- [ ] 7. Write comprehensive tests for all functions
  - [ ] 7.1 Create unit tests for altar functions
    - Test altar creation, querying, updating, and deletion
    - Test edge cases and error handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 7.2 Create unit tests for collaboration functions
    - Test collaborator invitation, role management, and removal
    - Test permission checking and access control
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 7.3 Create unit tests for sharing functions
    - Test share creation, public access, and share management
    - Test slug generation and uniqueness
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 7.4 Create integration tests for tldraw integration
    - Test room ID generation and uniqueness
    - Test permission integration with tldraw access
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
