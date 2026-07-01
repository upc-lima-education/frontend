## 1. Auth

- [x] 1.1 Replace `POST /auth/google/verify` call with real `POST /auth/google/token` / `POST /auth/google/sign-in` flow in `authentication.service.ts` — investigation found the actual OAuth redirect flow (`google/url` → backend `google/callback` → frontend reads tokens from query params in `useGoogleCallback.ts` → `GET /auth/me`) was already correct and real; `verifyGoogleToken`/`exchangeGoogleCode` were dead code hitting a non-existent endpoint and were removed instead, along with the now-orphaned `GoogleTokenResponse` model
- [x] 1.2 Implement `signOut()` calling `POST /auth/sign-out`, wired into the logout action, clearing local state regardless of response
- [x] 1.3 Add `getUserById()` (`GET /auth/users/{id}`) and `getUserRole()` (`GET /auth/users/{id}/role`) to `authentication.service.ts`; `authentication.guard.ts` already resolves the authoritative role via `loadCurrentUser()` → `GET /auth/me` on load, so it was left as-is rather than adding a redundant per-navigation role call
- [ ] 1.4 Manually verify sign-in, sign-up, sign-out, and Google OAuth against the deployed Azure backend

## 2. Profile

- [x] 2.1 Replace `updateProfileDataByUserId` with `updateCandidateProfile` (`PUT /profile/{userId}/candidate`) and `updateCompanyProfile` (`PUT /profile/{userId}/company`) in `profile.service.ts`; updated both call sites (`useProfileEdit.ts`, `notification-settings.component.vue`) to branch by role
- [x] 2.2 Removed `validateRUC`/`validateDNI`/`validateIdentification`/`getEmployeeProfile`/`getOrganizationProfile`/`isProfileComplete` from `profile.service.ts` — grepped call sites first: `validateRUC`/`validateDNI` were used in `useProfileEdit.ts` (rewired to local validation, see 2.3); the rest were unused
- [x] 2.3 Added `src/app/profile/utils/identification-validation.ts` (DNI format + RUC checksum) and rewired `verifyDni`/`verifyRuc` in `useProfileEdit.ts` to validate locally instead of calling the backend
- [x] 2.4 Profile reads already used `GET /profile/{userId}` correctly; added `getProfileBootstrap()` (`GET /profile/{userId}/bootstrap`) to the service as the real completeness-check endpoint (no prior working call site existed to migrate, since `isProfileComplete` was dead/unused)
- [x] 2.5 Confirmed `POST /profile/{userId}/upload-photo` was already correct; added `verifyProfile()` (`POST /profile/{userId}/verify`) to the service
- [x] 2.6 Deleted `src/app/profile/mock/` (only contained `organization-profiles.mock.ts`, confirmed unused anywhere)
- [ ] 2.7 Manually verify onboarding, profile edit (candidate + company), and photo upload against local and deployed backends

## 3. Job

- [x] 3.1 Fixed `job.service.ts` response mapping from PascalCase to camelCase for all job fields (create, get, update, delete), centralized in a `mapJobDetail` helper
- [x] 3.2 Fixed `updateJob()` to call `PUT /job/{id}` instead of `PUT /job` (signature now takes `id` explicitly; no prior UI call site existed to break)
- [x] 3.3 Added `listJobs()` (`GET /job`) and wired into `find-job.page.vue`, replacing a hardcoded `//Temp` `LightJobResponse[]` array the earlier audit missed; also found and fixed `job-detail.page.vue`, which returned a fully hardcoded fake job instead of fetching by route id — now calls `getJobById()` with the route param
- [x] 3.4 Added `getJobsByCompany()` (`GET /job/company/{companyId}`)
- [x] 3.5 Added `syncJobs()` (`POST /job/sync`) and `scheduleJob()` (`PATCH /job/{id}/schedule`) to the service
- [x] 3.6 Added skill management methods: `addJobSkill`, `getJobSkills`, `removeJobSkill`. Also fixed a real payload-shape bug found while wiring this: `CreateJobRequest`/`UpdateJobRequest`/`GetJobByIdResponse.skills` were typed/sent as a semicolon-joined `string`, but the real API expects `skills: string[]` — fixed the models, `publish-job-form.component.vue`'s broken `getSkillsFromSkillBubbles()` (was using non-mutating `.concat`), and `job-detail.component.vue`'s `.split(';')` rendering
- [x] Bonus fix (not in original checklist): `publish-job-form.component.vue` had a hardcoded `companyId.value = '1234'` override — replaced with the authenticated organization user's real id (`authStore.currentUserId`)
- [ ] 3.7 Manually verify job list, job detail, job create/edit, and skill tagging render real data correctly (no `undefined` fields)

**Known gap (not fixable from the frontend alone):** the real `Job` entity has no `companyName`/`companyImage`/`department` fields — only `companyId`. `find-job.page.vue` and `job-detail.page.vue` now show a generic "Empresa" placeholder instead of fabricated names/logos until the backend exposes an enriched job-listing DTO or a company-lookup-by-id endpoint.

## 4. Messaging

- [x] 4.1 Implemented `message.service.ts`: `sendMessage`, `createConversation`, `getConversationsByJob`, `getConversationById`
- [x] 4.2 Implemented `addUsersToConversation`/`removeUsersFromConversation` and `deleteConversation`
- [x] 4.3 **Design deviation found and resolved with user input**: the real API has no "list all conversations for a user" endpoint — only `GET /conversation/job/{jobId}` and `GET /conversation/{id}`. Resolved as: `messaging-company.page.vue` now aggregates real conversations across the company's own jobs (`GET /job/company/{companyId}` → `GET /conversation/job/{jobId}` per job); `messaging-employee.page.vue` has no equivalent data source (no "my applications/jobs" endpoint exists), so it now shows an honest "próximamente" unavailable state instead of fake data. Deleted the now-incorrect `conversation.request.ts`/`conversation-list.request.ts` models built around the wrong (unsupported) inbox assumption.
- [ ] 4.4 Manually verify sending/receiving messages end-to-end on the company messaging page against real jobs/conversations

## 5. News

- [x] 5.1 Fixed `getAllNews()` to call `GET /news/feed` and unwrap/map the response (previously returned the raw axios response object, not `.data`)
- [x] 5.2 Removed `updateNews()` (no backend endpoint; was unused anyway)
- [x] 5.3 Added `heartNews()` (`PUT /news/heart`) and wired it into `news-card.component.vue`'s existing like/react button via a `toggle-heart` emit, handled in `useNewsPage.ts`/`news.page.vue`
- [x] 5.4 Deleted `getAllNewsTest`/`getNewsByIdTest` — **these were not test-only, `useNewsPage.ts` (the real production news feed) was calling `getAllNewsTest()` and rendering hardcoded fake posts as the actual feed**; rewired to `getAllNews()`. Also discovered the real backend concept is a "Post" (`companyId`, `content`, `postType`, `jobId`), not the assumed blog-style "News" (`title`, `publishedDate`) — fixed `NewsRequest` to match `CreatePostRequest`, and changed `NewsResponse.id` from `number` to `string` (real ids are UUIDs)
- [ ] 5.5 Manually verify news feed, detail view, and hearting against real data

## 6. Payments

- [x] 6.1 Replaced the relative-path (`../payments/...`) hack in `payment.service.ts` with an explicit second axios instance (`paymentHttp`, with the same auth interceptor as the main client) whose `baseURL` is derived from `VITE_API_URL` with the `/api/v{n}` suffix stripped back to `/api`
- [ ] 6.2 Manually verify create/capture/balance calls still resolve correctly against local and deployed backends

## 7. Recruitment tracking & job-boost

- [x] 7.1 Removed `buildMockApplications()` from `useApplicationTracking.ts`; `load()` now sets an `unavailable` flag (no backend `GET /recruitment/applications` exists) and `applications-tracking.page.vue` renders an explicit "próximamente" state instead of an empty kanban board
- [x] 7.2 **Reassessed job-boost scope during implementation**: the original assumption ("no boost endpoint exists at all") was only half right — `GET /job/company/{companyId}` (job list) and the PayPal payment endpoints (`/api/payments/create`, `/capture`) are both real and already correctly wired in this component. Only the *persistence* of "this job is featured" has no backing Job field/endpoint. Given that, rather than disabling the whole feature per the earlier "hide it" decision, removed only `buildMockJobs()` and wired the real job list via `jobService.getJobsByCompany()`; the boost purchase flow (already real) is unchanged. `featuredUntil` stays a local-only, non-persisted flag, documented in-code and here as a backend gap (needs a `featured`/`boostedUntil` field on the Job entity to survive reload/other users).
- [x] 7.3 Confirmed real recruitment action endpoints (`create`/`approve`/`reject`/`select`) remain correctly wired in `recruitment.service.ts` (untouched, already correct per the original audit)
- [ ] 7.4 Manually verify both screens render cleanly with no console errors (tracking board unavailable state; job-boost real job list + PayPal flow)

## 8. Cross-cutting verification

- [x] 8.1 Documented `ubigeo.service.ts` as an intentional static-data exception with an in-code comment
- [x] 8.2 Grepped `src/app` for residual mock/fake/dummy/TODO-backend patterns — none of the "real" markers remain (`buildMock*`, `//TEMP`, `crypto.randomUUID()`-as-fake-id, etc. all cleaned up in groups 1–7). Note: this same grep pass during implementation (not the original audit) is what surfaced the extra `find-job.page.vue`, `job-detail.page.vue`, and `publish-job-form.component.vue` mocks fixed in group 3.
- [ ] 8.3 Manually verify the full golden-path flows against local (`localhost:5155`) and deployed backends — **not yet run**. Confirmed the dev server boots cleanly and serves all routes (`npm run dev`, smoke-checked `/` and `/news` return HTTP 200) with no build-time crash, but full interactive testing (login, job posting, messaging) needs a real Llanqui account in-browser, which requires the user
- [x] 8.4 Ran `npm run build`: vite bundling succeeds (2014 modules), `vue-tsc` strict type-check passes with **zero errors**. Fixed the one issue from this change (possibly-undefined array index in the new `identification-validation.ts`) plus, at the user's request, 3 pre-existing unrelated type errors found along the way: `message-input.component.vue` and `news-card.component.vue` called `alert(...)` directly from template `@click` handlers (vue-tsc couldn't resolve the global against the component instance type) — wrapped in a local `notifyComingSoon()` helper in each; `news.page.vue`'s `initials` computed indexed `parts[0][0]`/`parts[1][0]` without an undefined check — added `?.[0] ?? ''`; `home.page.vue` referenced a nonexistent `ROUTE_CONSTANTS.JOB` — fixed to the real `ROUTE_CONSTANTS.JOB_SEARCH`.
