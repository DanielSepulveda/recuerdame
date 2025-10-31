# Requirements Document

## Introduction

This document outlines the requirements for designing a Convex database schema that supports the Recuerdame collaborative digital altar application. The schema must handle altar creation and sharing, collaboration features, and integration with tldraw's sync engine for real-time collaborative editing of altar canvases. User management will be handled entirely by Clerk authentication.

## Requirements

### Requirement 1

**User Story:** As a user, I want to create and manage digital altars so that I can honor my deceased loved ones with personalized memorial spaces.

#### Acceptance Criteria

1. WHEN a user creates an altar THEN the system SHALL store altar metadata including title, description, and creation date
2. WHEN a user creates an altar THEN the system SHALL generate a unique identifier for tldraw room integration
3. WHEN a user views their altars THEN the system SHALL display all altars they own or collaborate on
4. WHEN a user deletes an altar THEN the system SHALL remove all associated data including tldraw room data
5. IF an altar has collaborators THEN the system SHALL prevent deletion without proper authorization

### Requirement 2

**User Story:** As a user, I want to share my altars publicly so that family and friends can view and contribute to the memorial from anywhere in the world.

#### Acceptance Criteria

1. WHEN a user enables public sharing THEN the system SHALL generate a unique shareable URL
2. WHEN a user requests a QR code THEN the system SHALL generate a QR code containing the shareable URL
3. WHEN someone visits a shared altar URL THEN the system SHALL display the altar without requiring authentication
4. WHEN a user disables sharing THEN the system SHALL invalidate the public URL and QR code
5. IF sharing is enabled THEN the system SHALL track basic analytics like view counts

### Requirement 3

**User Story:** As an altar owner, I want to manage who can collaborate on my altar so that I can control access while enabling meaningful participation.

#### Acceptance Criteria

1. WHEN an altar owner invites collaborators THEN the system SHALL store collaboration permissions with Clerk user IDs
2. WHEN a collaborator joins an altar THEN the system SHALL record their participation and access level
3. WHEN viewing an altar THEN the system SHALL query Clerk for collaborator information and display active collaborators
4. WHEN an owner removes a collaborator THEN the system SHALL revoke their access immediately
5. IF a collaborator has edit permissions THEN the system SHALL allow them to modify the altar canvas
6. IF a collaborator has view permissions THEN the system SHALL restrict them to read-only access

### Requirement 4

**User Story:** As a developer, I want the schema to integrate seamlessly with tldraw's sync engine so that real-time collaboration works efficiently without data duplication.

#### Acceptance Criteria

1. WHEN an altar is created THEN the system SHALL generate a tldraw room ID for canvas synchronization
2. WHEN users collaborate on an altar THEN the system SHALL rely on tldraw's sync engine for canvas data
3. WHEN storing altar metadata THEN the system SHALL NOT duplicate tldraw canvas data in Convex
4. WHEN a user joins an altar THEN the system SHALL provide the correct tldraw room ID for connection
5. IF tldraw sync fails THEN the system SHALL maintain altar metadata independently

### Requirement 5

**User Story:** As a user, I want my altar sharing and collaboration activities to be tracked so that I can see engagement and manage my digital memorials effectively.

#### Acceptance Criteria

1. WHEN someone views a shared altar THEN the system SHALL record the view with timestamp
2. WHEN a collaborator joins or leaves THEN the system SHALL log the activity
3. WHEN viewing altar analytics THEN the system SHALL display view counts and collaboration history
4. WHEN an altar is shared THEN the system SHALL track sharing method (URL, QR code)
5. IF analytics are requested THEN the system SHALL provide data without exposing personal information of viewers
