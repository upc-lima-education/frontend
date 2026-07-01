## ADDED Requirements

### Requirement: Candidate and company profile updates use role-specific endpoints
The system SHALL update a candidate profile via `PUT /profile/{userId}/candidate` and a company profile via `PUT /profile/{userId}/company`, and SHALL NOT call a generic `PUT /profile/{userId}` endpoint (which does not exist on the backend).

#### Scenario: Candidate saves profile changes
- **WHEN** a candidate user submits profile edits
- **THEN** the frontend calls `PUT /profile/{userId}/candidate` with the candidate payload

#### Scenario: Company saves profile changes
- **WHEN** an organization user submits profile edits
- **THEN** the frontend calls `PUT /profile/{userId}/company` with the company payload

### Requirement: Profile reads use the real read endpoints
The system SHALL read profile data via `GET /profile/{userId}` and profile completeness/onboarding state via `GET /profile/{userId}/bootstrap`, and SHALL NOT call the non-existent `GET /profile/employee/{id}`, `GET /profile/organization/{id}`, or `GET /profile/{userId}/is-complete` endpoints.

#### Scenario: App loads a user's profile
- **WHEN** any screen needs a user's profile data
- **THEN** it is fetched via `GET /profile/{userId}`

#### Scenario: App determines onboarding completeness
- **WHEN** the app needs to know whether a user's profile is complete enough to proceed
- **THEN** it derives that from `GET /profile/{userId}/bootstrap`

### Requirement: Identity document validation is performed client-side
The system SHALL validate RUC/DNI format locally (digit count and checksum) instead of calling non-existent backend validation endpoints, and SHALL rely on `POST /profile/{userId}/verify` for authoritative identity verification.

#### Scenario: User enters a RUC/DNI during onboarding
- **WHEN** the user types an identification number
- **THEN** the frontend validates its format/checksum locally without any network call, and final verification happens through `POST /profile/{userId}/verify`

### Requirement: Profile photo upload uses the real endpoint
The system SHALL upload profile photos via `POST /profile/{userId}/upload-photo`.

#### Scenario: User uploads a new avatar
- **WHEN** the user selects a new profile photo
- **THEN** the frontend uploads it via `POST /profile/{userId}/upload-photo`
