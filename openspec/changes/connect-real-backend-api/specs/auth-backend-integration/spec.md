## ADDED Requirements

### Requirement: Google OAuth exchange uses real endpoints
The system SHALL exchange a Google authorization code/credential for a Llanqui session by calling the real backend endpoints (`POST /auth/google/token` and/or `POST /auth/google/sign-in`), and SHALL NOT call any non-existent `POST /auth/google/verify` endpoint.

#### Scenario: User completes Google sign-in
- **WHEN** the user finishes the Google OAuth redirect and the frontend receives the callback data
- **THEN** the frontend calls the real `POST /auth/google/token` (or `/auth/google/sign-in`) endpoint and, on success, stores the returned session/token the same way as email/password sign-in

### Requirement: User can sign out
The system SHALL invalidate the session on the backend when the user logs out, not only clear local state.

#### Scenario: User clicks logout
- **WHEN** the user triggers logout
- **THEN** the frontend calls `POST /auth/sign-out` and then clears local auth state/token regardless of the response (network failure SHALL NOT block local logout)

### Requirement: Role and user lookups use authoritative backend data
The system SHALL fetch a user's role via `GET /auth/users/{id}/role` (or `GET /auth/users/{id}`) for role-gated routing decisions, rather than relying solely on client-decoded token claims.

#### Scenario: Route guard checks role
- **WHEN** the authentication guard needs to authorize access to a role-specific route
- **THEN** it resolves the role from the backend-authoritative source instead of trusting only locally cached/decoded state
