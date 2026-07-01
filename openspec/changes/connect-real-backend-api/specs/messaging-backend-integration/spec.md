## ADDED Requirements

### Requirement: Conversation lists load from the real backend
The system SHALL fetch conversations from the real backend (`GET /conversation/job/{jobId}`, `GET /conversation/{id}`) instead of returning hardcoded sample conversations. The backend exposes no aggregate "all conversations for a user" endpoint, only per-job listing, so each surface SHALL only present a conversation list when it has a real, backend-supported way to know which jobs/conversations belong to it.

#### Scenario: Company opens messaging
- **WHEN** a company user opens the messaging page
- **THEN** the frontend fetches the company's own jobs (`GET /job/company/{companyId}`) and aggregates their conversations via `GET /conversation/job/{jobId}` per job, with no hardcoded names, avatars, or placeholder text

#### Scenario: Employee opens messaging
- **WHEN** an employee opens the messaging page
- **THEN** the frontend shows an explicit "not available yet" state instead of a conversation list, since the backend exposes no endpoint to determine which jobs/conversations a given candidate participates in

### Requirement: Messages are sent and read via the real conversation endpoints
The system SHALL send messages via `POST /conversation/send-message` and create new conversations via `POST /conversation`, and SHALL NOT leave `message.service.ts` methods unimplemented.

#### Scenario: User sends a chat message
- **WHEN** a user types and sends a message in a conversation
- **THEN** the frontend calls `POST /conversation/send-message` and the message appears in the thread only after a successful backend response (or optimistically with rollback on failure)

#### Scenario: User starts a new conversation about a job
- **WHEN** a user initiates a conversation from a job listing
- **THEN** the frontend calls `POST /conversation` to create it

### Requirement: Conversation participants are managed via the real endpoints
The system SHALL add and remove conversation participants via `POST /conversation/{id}/users` and `DELETE /conversation/{id}/users`, and delete conversations via `DELETE /conversation/{id}`.

#### Scenario: User is added to a conversation
- **WHEN** a participant needs to be added to an existing conversation
- **THEN** the frontend calls `POST /conversation/{id}/users`
