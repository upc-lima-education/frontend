## ADDED Requirements

### Requirement: News feed loads from the real feed endpoint
The system SHALL fetch the news list via `GET /news/feed`, not `GET /news`.

#### Scenario: User opens the news page
- **WHEN** the news page loads
- **THEN** the frontend calls `GET /news/feed` to populate the list

### Requirement: News liking uses the real heart endpoint
The system SHALL toggle a news item's "like"/heart state via `PUT /news/heart`.

#### Scenario: User hearts a news item
- **WHEN** a user clicks the heart/like icon on a news item
- **THEN** the frontend calls `PUT /news/heart` with that item's id

### Requirement: No client-side news update call
The system SHALL NOT call any news update endpoint (`PUT /news/{id}`), since the backend does not expose one; any UI implying news editing SHALL be removed or clearly marked unavailable.

#### Scenario: Admin attempts to edit a news item
- **WHEN** there is no backend support for editing a news item
- **THEN** the UI does not offer an edit action that calls a non-existent endpoint

### Requirement: No hardcoded news test data in production code paths
The system SHALL NOT include hardcoded mock news arrays (e.g. `getAllNewsTest`/`getNewsByIdTest`) reachable from any production page.

#### Scenario: News page renders with zero backend items
- **WHEN** the real feed endpoint returns an empty list
- **THEN** the UI shows a genuine empty state instead of falling back to hardcoded sample news
