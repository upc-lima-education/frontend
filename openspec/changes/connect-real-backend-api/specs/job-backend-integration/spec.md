## ADDED Requirements

### Requirement: Job data is mapped using the backend's camelCase field names
The system SHALL map job API responses using camelCase field names (`id`, `companyId`, `title`, `jobStatus`, `creationDate`, etc.) as returned by the real backend, and SHALL NOT read PascalCase fields that do not exist in the response.

#### Scenario: Job list renders after fetch
- **WHEN** the frontend fetches jobs from the backend
- **THEN** every displayed field (title, status, dates, company) is populated from the camelCase response fields, with none rendering as `undefined`

### Requirement: Job update targets the specific job resource
The system SHALL call `PUT /job/{id}` to update a job, not `PUT /job`.

#### Scenario: Employer edits a job posting
- **WHEN** an employer saves changes to an existing job
- **THEN** the frontend sends `PUT /job/{id}` with that job's id in the URL

### Requirement: Job listing and search use the real list endpoint
The system SHALL fetch job listings via `GET /job`, and per-company listings via `GET /job/company/{companyId}`.

#### Scenario: User browses jobs
- **WHEN** the find-job page loads
- **THEN** it calls `GET /job` to populate results

#### Scenario: Company views its own postings
- **WHEN** an organization views its job postings
- **THEN** the frontend calls `GET /job/company/{companyId}`

### Requirement: Job scheduling and sync use their dedicated endpoints
The system SHALL schedule a job via `PATCH /job/{id}/schedule` and trigger job sync via `POST /job/sync` where those actions are exposed in the UI.

#### Scenario: Employer schedules a job posting
- **WHEN** an employer sets a publish schedule for a job
- **THEN** the frontend calls `PATCH /job/{id}/schedule`

### Requirement: Job skill tagging uses the real skill sub-resource endpoints
The system SHALL manage a job's skills via `POST /job/{id}/skill`, `GET /job/{id}/skills`, and `DELETE /job/{jobId}/skill/{skillId}`.

#### Scenario: Employer tags a job with a skill
- **WHEN** an employer adds a required skill to a job posting
- **THEN** the frontend calls `POST /job/{id}/skill`

#### Scenario: Employer removes a skill from a job
- **WHEN** an employer removes a previously added skill
- **THEN** the frontend calls `DELETE /job/{jobId}/skill/{skillId}`
