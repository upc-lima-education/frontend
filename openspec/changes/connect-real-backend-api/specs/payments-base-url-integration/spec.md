## ADDED Requirements

### Requirement: Payment requests use an explicit base URL, not a relative-path hack
The system SHALL issue payment requests (`POST /payments/create`, `POST /payments/capture`, `GET /payments/balance`) through an explicitly configured client pointed at the API root, and SHALL NOT rely on relative dot-segment paths (e.g. `../payments/...`) to escape the `/api/v1` base URL.

#### Scenario: User initiates a payment
- **WHEN** the frontend calls the payments API for create, capture, or balance
- **THEN** the request resolves to `/api/payments/<action>` regardless of trailing slashes or path depth changes in `VITE_API_URL`

#### Scenario: VITE_API_URL changes shape
- **WHEN** `VITE_API_URL` is reconfigured (e.g. adds a trailing slash or extra path segment)
- **THEN** payment requests continue to resolve to the correct `/api/payments/*` path without silent breakage
