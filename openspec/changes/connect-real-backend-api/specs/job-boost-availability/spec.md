## ADDED Requirements

### Requirement: Job boost job selection uses the real job list
The system SHALL NOT render a hardcoded/generated list of boostable jobs. The job-boost settings UI SHALL list the organization's real jobs via `GET /job/company/{companyId}`, since that endpoint exists and the payment flow (`/api/payments/create`, `/api/payments/capture`) is also real and already correctly wired.

#### Scenario: Organization opens job-boost settings
- **WHEN** an organization user navigates to the job-boost tab in settings
- **THEN** the job picker shows that organization's real jobs (no fabricated entries), and payment is processed through the real PayPal endpoints

### Requirement: Featured/boosted status is honestly non-persistent
The backend's Job entity has no `featured`/`boostedUntil` field or endpoint to persist that a job is currently boosted. The system SHALL NOT fake persistence of this state (e.g. by writing it to a non-existent endpoint); the boosted flag MAY be held client-side only for the current session, and this limitation SHALL be documented in code as a known backend gap rather than silently appearing to work across reloads or other users.

#### Scenario: Organization boosts a job and reloads the page
- **WHEN** a payment succeeds and the job is marked featured, then the user reloads the settings page or another user views the job listing
- **THEN** the featured state is not guaranteed to persist, since no backend field backs it — this is a known, documented gap, not a silent failure
