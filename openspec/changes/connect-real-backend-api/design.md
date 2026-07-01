## Context

The frontend (Vue 3 + Vite + TS + Pinia + axios) talks to a .NET backend through a single axios instance (`src/app/shared/services/base.service.ts`) configured via `VITE_API_URL` (local `http://localhost:5155/api/v1`, deployed Azure Container Apps `https://ca-llanqui-backend.wittytree-b712258b.centralus.azurecontainerapps.io/api/v1`). The real contract was pulled live from the deployed backend's `/swagger/v1/swagger.json` (53 endpoints) since `API.MD` in the repo is empty. An Explore-agent audit compared every `*.service.ts` against that contract and found: one critical field-casing bug, several endpoints called at wrong/non-existent paths, two auth/profile flows that are stubbed or missing, one module (messaging) that is 100% hardcoded fake data, and two features (recruitment application tracking, job-boost) with no backing endpoint on the backend at all.

## Goals / Non-Goals

**Goals:**
- Every service in `src/app/**/services/*.ts` calls a real, existing backend endpoint with the correct path, method, and payload/response shape (matching the live swagger contract).
- No component renders hardcoded/sample/mock arrays as if they were live data.
- Where the backend has no corresponding endpoint (recruitment list, job-boost), the UI honestly reflects "not available" rather than faking data.
- Works unchanged against both local (`localhost:5155`) and deployed (Azure) backends purely via `VITE_API_URL`.

**Non-Goals:**
- Building new backend endpoints (recruitment list, job-boost, news update) — out of scope for this frontend-only change.
- Visual/UX redesign of affected screens — only data-wiring changes; existing layout stays unless a mock element (e.g. hardcoded avatar) must be removed.
- Changing the auth token/interceptor mechanism itself (`authentication.interceptor.ts`) beyond what's needed to add `signOut()`.

## Decisions

1. **Source of truth for the contract is the live swagger, not `API.MD`.** `API.MD` is empty; re-deriving the contract from `GET /swagger/v1/swagger.json` on the deployed backend is more reliable than guessing from frontend code. Alternative considered: infer purely from existing frontend code — rejected, since that's exactly what produced the drift being fixed.

2. **Fix field casing at the service boundary, not throughout the app.** `job.service.ts` will map/type responses as camelCase (matching the API) at the point where axios responses are received, so every consumer (components, stores) already expects camelCase — no casing-adapter layer, no per-component fixes needed. Alternative considered: add a generic case-conversion interceptor — rejected as unnecessary complexity since only `job.service.ts` has this bug.

3. **Split `updateProfileDataByUserId` into role-specific methods** (`updateCandidateProfile`, `updateCompanyProfile`) mirroring the backend's own split (`PUT /profile/{userId}/candidate` vs `.../company`), rather than keeping one generic method that branches internally. This matches the backend's modeling of candidate vs company profiles as distinct resources and avoids building a payload-merging shim in the frontend.

4. **Client-side identity validation (RUC/DNI) replaces the removed backend validate-* calls.** Since `/profile/validate-ruc` etc. don't exist on the backend, format/checksum validation (Peru RUC = 11 digits with valid check digit, DNI = 8 digits) moves to a local utility. This is a reduced guarantee (no uniqueness/registry check) — acceptable because full identity verification already happens via `POST /profile/{userId}/verify`.

5. **Recruitment tracking and job-boost render an explicit "not available" state, not a hidden/removed feature.** Since these are existing settings/dashboard entries users may expect, silently removing the nav entry would be more confusing than a clear disabled state (e.g. "Próximamente" empty-state card). Alternative considered: fully hide the routes — rejected per user decision to keep them visible but honest about unavailability.

6. **Payments client becomes an explicit second axios instance** (`paymentHttp`, baseURL = API origin without `/v1` suffix, i.e. `.../api`), replacing the `../payments/...` relative-path hack. Alternative considered: keep the relative-path trick but document it — rejected because it depends on undocumented URL-normalization behavior and breaks if `VITE_API_URL` ever changes shape (trailing slash, extra segment).

7. **`ubigeo.service.ts` stays as static bundled JSON** — confirmed no backend endpoint exists for it; documented in the relevant spec as an intentional exception so it isn't "fixed" into a fake API call later.

## Risks / Trade-offs

- [Risk] Local backend (`localhost:5155`) wasn't reachable during this audit (only the deployed swagger was fetched) → some local-only behavior could differ. **Mitigation**: verify each fixed flow manually against local backend during implementation/testing (per project convention of testing golden path in-browser before calling done).
- [Risk] Removing `getEmployeeProfile`/`getOrganizationProfile`/`isProfileComplete` is a breaking change for any component still calling them. **Mitigation**: grep all call sites before deletion and update them as part of the same task, not left dangling.
- [Risk] Google OAuth end-to-end flow (`url` → redirect → `callback`/`token`/`sign-in`) has no local way to fully test without a real Google OAuth app config. **Mitigation**: test against the deployed Azure backend where OAuth is already configured.
- [Risk] Disabling recruitment tracking and job-boost removes functionality users may currently rely on (even if backed by fake data). **Mitigation**: explicit user decision already made — ship the honest empty state; flag both as follow-up backend work in the proposal's Impact section.

## Migration Plan

- No data migration; this is a pure frontend contract-alignment change deployed like any other Netlify build.
- Roll out module-by-module (auth → profile → job → messaging → news → payments → recruitment/job-boost UI states) so each can be manually verified against both local and deployed backends before moving to the next, per `tasks.md`.
- Rollback: standard Netlify revert-to-previous-deploy if a regression is found post-deploy; no backend/schema coupling to unwind.

## Open Questions

- None blocking — recruitment-list and job-boost backend endpoints are acknowledged gaps to be scheduled as separate backend work, not resolved here.
