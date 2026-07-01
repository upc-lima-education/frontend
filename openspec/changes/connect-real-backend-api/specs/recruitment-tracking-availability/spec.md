## ADDED Requirements

### Requirement: Applicant tracking shows an honest unavailable state instead of mock data
The system SHALL NOT render a hardcoded/generated list of applications. Since the backend does not currently expose a list endpoint for recruitment applications, the applicant tracking UI SHALL display a clear "not available yet" empty state instead.

#### Scenario: Employer opens applicant tracking
- **WHEN** an employer navigates to the applicant tracking view
- **THEN** the UI shows an explicit unavailable/empty state (no fabricated applicant cards) explaining that this feature is pending backend support

### Requirement: Existing application actions still use real endpoints
The system SHALL continue to call the real `POST /recruitment/applications`, `POST /recruitment/applications/{id}/approve`, `POST /recruitment/applications/{id}/reject`, and `POST /recruitment/applications/{id}/select` endpoints for actions that are already backed by the API, independent of the listing gap.

#### Scenario: Employer approves an application reached via another flow
- **WHEN** an employer approves an application (e.g. from a notification or job-detail context, not the tracking list)
- **THEN** the frontend calls `POST /recruitment/applications/{id}/approve`
