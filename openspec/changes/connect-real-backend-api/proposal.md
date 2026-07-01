## Why

The frontend was built against an assumed API contract that has drifted from the real backend (deployed on Azure + local .NET, 53 endpoints under `/api/v1` and `/api/payments`). Several core flows are silently broken (job field casing mismatch makes every job field `undefined`, Google OAuth calls a non-existent endpoint, profile updates hit a path that doesn't exist) and several modules render hardcoded/mock data instead of calling the real API (messaging, recruitment application tracking, job-boost settings, parts of news). The project needs to be realigned end-to-end with the actual backend contract so every flow works against real data, in both local (.NET on `localhost:5155`) and deployed (Azure Container Apps) environments.

## What Changes

- **BREAKING**: `job.service.ts` response mapping switches from PascalCase (`Id`, `Title`, `JobStatus`...) to camelCase to match the real API — any code reading the old PascalCase fields must be updated.
- **BREAKING**: `profile.service.ts` drops `updateProfileDataByUserId` (generic `PUT /profile/{userId}`, endpoint doesn't exist) in favor of separate `updateCandidateProfile` (`PUT /profile/{userId}/candidate`) and `updateCompanyProfile` (`PUT /profile/{userId}/company`) calls.
- **BREAKING**: `profile.service.ts` drops `validateRUC`/`validateDNI`/`validateIdentification`/`getEmployeeProfile`/`getOrganizationProfile`/`isProfileComplete` (all hit non-existent paths); identification validation moves client-side where possible, profile reads go through `GET /profile/{userId}` and `GET /profile/{userId}/bootstrap`.
- Fix `authentication.service.ts`: replace the non-existent `POST /auth/google/verify` call with the real `POST /auth/google/token` / `POST /auth/google/sign-in` flow; add `signOut()` calling `POST /auth/sign-out`; add authoritative role/user lookup via `GET /auth/users/{id}` and `GET /auth/users/{id}/role`.
- Fix `job.service.ts`: correct `updateJob()` to `PUT /job/{id}` (was `PUT /job`); add missing `listJobs` (`GET /job`), `getJobsByCompany` (`GET /job/company/{companyId}`), `syncJobs` (`POST /job/sync`), `scheduleJob` (`PATCH /job/{id}/schedule`), and skill management (`POST /job/{id}/skill`, `GET /job/{id}/skills`, `DELETE /job/{jobId}/skill/{skillId}`).
- Replace hardcoded fake conversations/messages in `messaging-employee.page.vue` / `messaging-company.page.vue` and empty stubs in `message.service.ts` with real calls to `/conversation` endpoints (create, get by job, get by id, send message, add/remove users, delete).
- Fix `news.service.ts`: `getAllNews()` → `GET /news/feed`; remove the non-existent `updateNews()` call; add `heartNews()` (`PUT /news/heart`); remove `getAllNewsTest`/`getNewsByIdTest` hardcoded mock data.
- Harden `payment.service.ts`: replace the relative-path (`../payments/...`) escape hack with an explicit second axios client pointed at the API root, so it doesn't silently break if `VITE_API_URL` changes shape.
- Recruitment application tracking (`useApplicationTracking.ts`) and job-boost settings (`job-boost-settings.component.vue`): remove mock data generators; since the backend has no list/boost endpoints yet, these UI sections render a disabled/empty "not available yet" state instead of fake data.
- Document `ubigeo.service.ts` (static bundled Peru geo-data, no backend endpoint) as an intentional exception, not tech debt.

## Capabilities

### New Capabilities
- `auth-backend-integration`: sign-in/sign-up/sign-out/Google OAuth/session and role lookup wired to the real `/auth/*` endpoints.
- `profile-backend-integration`: profile read/bootstrap/candidate-update/company-update/verify/photo-upload wired to real `/profile/*` endpoints.
- `job-backend-integration`: job CRUD, listing, company jobs, scheduling, and skill tagging wired to real `/job/*` endpoints with correct field casing.
- `messaging-backend-integration`: conversations and messages wired to real `/conversation/*` endpoints, replacing all hardcoded chat data.
- `news-backend-integration`: news feed, detail, and heart/like wired to real `/news/*` endpoints, removing update calls and test mocks.
- `payments-base-url-integration`: explicit, non-hacky base URL handling for the `/api/payments/*` group.
- `recruitment-tracking-availability`: applicant tracking UI reflects real backend availability (disabled/empty state, no mock list) until a list endpoint exists.
- `job-boost-availability`: job-boost settings UI reflects real backend availability (disabled/empty state, no mock jobs) until a boost endpoint exists.

### Modified Capabilities
(none — no existing specs in `openspec/specs/` yet; this change establishes the first baseline specs.)

## Impact

- Affected files: `src/app/auth/services/authentication.service.ts`, `src/app/profile/services/profile.service.ts`, `src/app/profile/mock/organization-profiles.mock.ts`, `src/app/job/services/job.service.ts`, `src/app/message/services/message.service.ts`, `src/app/message/pages/messaging-employee.page.vue`, `src/app/message/pages/messaging-company.page.vue`, `src/app/news/services/news.service.ts`, `src/app/shared/services/payment.service.ts`, `src/app/recruitment/composables/useApplicationTracking.ts`, `src/app/settings/components/job-boost-settings.component.vue`.
- No backend changes in scope — this change only realigns the frontend to the existing, already-deployed API contract (`swagger_azure.json`, 53 endpoints). Recruitment listing and job-boost remain backend gaps, called out explicitly rather than papered over with mock data.
- Environments: must work against both `http://localhost:5155/api/v1` (local .NET) and the deployed Azure Container Apps URL, via `VITE_API_URL`.
