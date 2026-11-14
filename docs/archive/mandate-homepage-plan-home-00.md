# RUN-MANDATE-HOME-00 — Repository audit and implementation plan

Companion contract: `docs/mandate-homepage-brief.md`. This document describes inspected code and recommended future work; proposed files/APIs are not implemented in this run.

## 1. Repository baseline

- Workspace: `/Users/marceloambiel/.codex/.chatgpt-projects/g-p-6a9a6f2317f08191a53cd78f5018f295/deliverables/futureproofing-mandate-studio/mandate-studio-v1`.
- Branch `main`; HEAD `7574f74` (`feat: initial commit`).
- At audit start, eight tracked files were modified: `README.md`, `index.html`, `package.json`, `pnpm-lock.yaml`, `src/App.tsx`, `src/components/ui/button.tsx`, `src/index.css`, `src/main.tsx`. Their existing diff was 962 insertions/130 deletions.
- Substantial existing app work is untracked: `.checkpoints/`, `.impeccable/`, `docs/`, Playwright/Vitest configs, `public/{avatars,brand,company-logos,process,videos}/`, `scripts/`, `src/{app,domain,features,hooks,pages,state}/`, `src/components/workspace/`, additional UI primitives, `MarketingHeroVideo.tsx` and `src/theme.css`.
- Do not use `git checkout`, `git restore`, `git clean`, a reset or broad formatting to establish a baseline. Git HEAD does not contain most of the current app. A content-hash manifest of 818 existing non-ignored files was recorded before writing these two documents, to verify that this run preserves them.

Stack: React 19, TypeScript, Vite 8, React Router 7, Tailwind 4, Base UI/shadcn primitives, Remix icons, Vitest/jsdom, Playwright and axe. `@/` resolves to `src/` in Vite/Vitest. No dependency addition is required for the proposed homepage.

## 2. Actual entry points, routes and state

| Path | Existing role |
|---|---|
| `src/main.tsx` | StrictMode/createRoot; imports global CSS, theme tokens and document scrollbars. |
| `src/App.tsx` | Route table; lazy marketing Home/Process/Experts/notes. Wraps all routes with WorkspaceProvider and WorkspaceV2Provider. Uses BrowserRouter normally and MemoryRouter inside an iframe. |
| `src/pages/Home.tsx` | Landing-page composition, header/mobile menu, hero, all marketing sections, inline workspace iframe, GuidedDemo and enquiry form. Most sections are inline JSX, not independent section components. |
| `src/pages/marketing-v2.css` | Marketing layouts plus guided-demo styles. Contains successive overrides; inspect the final cascade rather than assuming the first rule wins. |
| `src/index.css` | Tailwind imports, Inter Variable import, semantic color mappings, legacy/global layouts and shared rules. Broad edits can affect both the site and app. |
| `src/theme.css` | Current semantic palette/motion/radius tokens. `docs/DESIGN_SYSTEM.md` records approved app-specific responsive rules. |

Routes: `/` → Home; `/workspace` and `/workspace/home` → WorkspaceHome inside Shell; `/workspace/experts` → Experts; assignment layout children `/workspace/assignment`, `/workspace/candidates`, `/workspace/discussion`, `/workspace/completed`; `/process` → Process; `/prototype-notes` → PrototypeNotes; wildcard → NotFound. `/?conversation=1` opens the existing website enquiry modal.

`WorkspaceProvider.tsx` owns `WorkspaceSession` (`src/state/session.ts`), saves brief versions under `mandate-studio:v1`, and handles external-storage events/recovery/conflicts. `WorkspaceV2Provider.tsx` owns candidate membership, notification acknowledgements/presentation, assignment detail revisions and workflow progress under `mandate-studio:v2:preferences`. Same-origin iframes have independent React/session instances but share browser storage and receive storage events. Unsaved working documents are instance-local memory, not shared buffers.

`WorkspaceProvider` already accepts a storage adapter. `WorkspaceV2Provider` currently does not; it creates its preference session from browser localStorage. Therefore, mounting additional provider islands would not automatically isolate their effects.

## 3. Header, hero and conversion behavior to retain

- `src/pages/Home.tsx`: desktop links to `#our-process`, `#challenges`, `/workspace`; mobile native-details menu with Escape/outside-pointer handling. Existing sample-link copy is **Open sample workspace**; the new contract requires **Explore sample workspace** in the hero.
- `src/components/MarketingHeroVideo.tsx`: two-video playlist, crossfade, muted/inline playback, Pause/Play, reduced-motion static state, page-visibility pause and media-error fallback.
- Website header is absolute over the hero, not a fixed-on-scroll header. It uses a dark 65% fill/18px blur; hero copy/actions are centered. Do not add a sticky behavior or announcement strip merely because a reference has one.
- Request a conversation opens the local enquiry modal in Home. Validation focuses missing Name/Work email/Leadership need. Submission is a synthetic demo acknowledgement, with no network delivery. Closing removes the `conversation` query parameter when present.
- `src/features/AssignmentComplete.tsx`: final success layout remains; primary CTA links to `/?conversation=1`; Restart demo resets both stores and returns to `/workspace`; View submitted assignment opens `/workspace/discussion`.

## 4. Embedded dashboard, expansion and return: what actually exists

The section titled “A changed priority. A clearer discussion.” is currently immediately after the hero. It renders one lazy iframe in `.working-preview-surface`, with `src="/workspace?preview=1"`, title `Interactive Mandate Studio sample workspace Home`, and a stable `previewFrame` ref passed to GuidedDemo.

Inside that iframe, `src/features/WorkspaceHome.tsx` renders the assistant entry component and `src/features/ExecutiveDashboard.tsx`. The route does not turn the `preview=1` query into the `WorkspaceHome` preview prop: the prop defaults to false and the App route passes none. The query is therefore not an isolation/read-only/cosmetic mode. This is a full live demo instance with notifications and persisted behavior.

`src/components/workspace/GuidedDemo.tsx` opens a **separate** iframe inside a large Dialog. Desktop CSS is viewport-minus-32px with a 1440px maximum; at <=650px it is full viewport. This is the existing near-full-screen guided presentation, not the inline dashboard expanding in place. There is no dedicated same-instance dashboard Expand/Collapse control or browser Fullscreen API call in the inspected code.

Guide close/Skip/Finish stores/restores host window scroll and returns focus to Start guided demo. Its Open live sample workspace action navigates the host router to `/workspace`. The demo shell’s Website link is a regular router link to `/`. In an iframe’s MemoryRouter, that renders Home **inside the frame**; it does not close the host overlay or restore the host website.

Preserve the existing features where working, but do not describe missing same-instance expansion or host return as already implemented. Any new expansion needs a specified lifecycle. If the intent is to preserve an in-progress inline editor, avoid remounting/rekeying/moving its iframe into another React portal container; use a persistent frame host with a carefully tested expanded presentation, or an explicit safe handoff. A second guided frame does not automatically carry the first frame’s unsaved state.

## 5. Application component inventory and reuse boundaries

| Capability | Existing files | Reuse/dependency notes |
|---|---|---|
| Assignment context, step layout | `src/features/AssignmentLayout.tsx`; `src/components/workspace/MobileAssignmentPager.tsx`; `src/state/AssignmentFlowProvider.tsx`; `src/domain/assignment-flow.ts` | Real three-step flow, mobile swipe/current-step display, persistent summary disclosure. Candidates/Discussion are locked until preceding actions; generation is local 2400/2600ms simulation. Do not change these to implement a four-stage marketing rail. |
| Revised assignment/requirements | `src/features/Assignment.tsx`; `AssignmentDetails.tsx`; `src/domain/assignment-details.ts` | Real editing/restoration updates revisions and requires fresh review. AssignmentDetails reads global V2 state; it is not a pure static card. |
| Client brief and history | `src/components/workspace/ClientBriefDocument.tsx`; `MandateVersions.tsx`; `FieldHistory.tsx`; `src/domain/v2.ts`; `client-brief-content.ts` | ClientBriefDocument is directly reusable with its document prop. MandateVersions/FieldHistory use actual supplied version data and local dialog state. `VersionComparison.tsx` exists but has no current import/use in src; do not substitute that older comparison UI for the current history architecture. |
| Candidate discovery/list | `src/features/Experts.tsx`; `IncludedProfiles.tsx`; `src/domain/candidate-directory.ts`; `model.ts` | Shared list/cards, filtering, membership, add/remove confirmation. CandidateOverviewCard reads V2 state and exposes membership actions; do not mount it as an unqualified marketing interaction that mutates the live shortlist. |
| Profile drawer/tabs | `src/components/workspace/CandidateFullProfile.tsx`; `CandidateProfileTabs.tsx`; `CandidateProfile.tsx`; `src/domain/candidate-profile-details.ts` | CandidateFullProfile takes candidate/onClose/optional source; owns its drawer/tab/focus state, without needing a new app session. Experience/Education/Projects/Skill Map and CandidateAvatar are reusable authentic UI. |
| Comparison and evidence sources | exported `ComparisonTable` in `src/features/Candidates.tsx`; `src/components/workspace/ComparisonSource.tsx`; `src/domain/comparison.ts`; `comparison-sources.ts` | Table reads live included IDs from V2; onSelect opens the profile/source area. Prefer an optional explicit candidates/rows presentation input or extract the existing renderer for deterministic marketing examples; keep app defaults and matching logic unchanged. |
| Discussion document/edit/history | `src/features/Discussion.tsx`; `src/domain/discussion-document.ts`; `document-font-size.ts`; `src/features/discussion-document.css` | DiscussionEditor and DocumentHistory are private functions in Discussion.tsx, not standalone exports. The route consumes the workspace/session/router/flow and must not be embedded repeatedly. Reuse the existing document builder/sanitizer and minimally expose its presentational renderer; actual editing/saving/version history stays in the one real workspace. |
| Loading, changes, notifications | `AssignmentGeneration.tsx`; `AssignmentUpdateToast.tsx`; `HomeAssignmentNotification.tsx`; `Notifications.tsx` under `src/components/workspace/` | These can run timers, mark notifications viewed/presented or advance workflow. Do not mount active notification/generation components just for decorative marketing art. |
| Completion/reset/recovery | `src/features/AssignmentComplete.tsx`; `src/hooks/use-assignment-submitted.ts`; `src/components/workspace/RecoveryNotice.tsx` (exports ResetSample); `src/app/Shell.tsx` | Reset must use the existing session/preferences reset operations, not clear all localStorage. Keep deliberate reset and final conversion/restart/view actions. Completed Northline moves out of the homepage current list and loses the active-assignment badge. |
| UI primitives | `src/components/ui/{button,dialog,sheet,input,textarea}.tsx`; `overlay-focus.ts`; `confirmation-dialog.css` | Reuse existing semantics, focus trapping and confirmation styling. Profile/dialog portals need scoped website QA; `.assignment-page` ancestry currently influences some styles. |

## 6. Proposed authentic showcase composition (minimum state)

Use actual presentational components with the existing immutable domain data for sections 02–06. Retain only small marketing UI state: selected feature/stage, selected candidate, open profile/history. Do not clone WorkspaceSession, persist section selections as app workflow progress, or place an App/router/provider pair in every card.

| Section/card | Authentic preview and action |
|---|---|
| Growth & scale | Actual `ProfileExperience`/`CandidateFullProfile` for Claire’s supplied multi-site experience; show scope/evidence limitations. Local selection opens the real drawer. |
| Acquisition integration | Actual `ClientBriefDocument` for the revised brief, with `MandateVersions` access to the original document. |
| Time-sensitive appointments | Actual comparison availability criterion (30/45/90 days against 60), using the existing comparison renderer/logic, not a new score widget. |
| Living mandate | Current/previous ClientBriefDocument and actual version/history components; derive structured requirements from the same facts. Demonstrate editing concepts read-only, with an honest “try in sample” entry for mutations. |
| Candidate evaluation | Shared candidate card presentation without membership writes, actual profile drawer, existing comparison matrix and source focus. Use the same candidates/status functions, not independent match labels. |
| Discussion brief | Build/sanitize the actual seeded discussion document and render the shared document presentation. Show a real saved-version record where available; do not invent a new editor/version store. Editing/Save/Send actions enter the live sample and obey its unlock/review flow. |
| Four-stage rail | Local accessible stage selector plus the above previews. Fourth stage shows the review/completion concept. Keep the real demo’s three-step workflow intact. |

Minimum recommended new production files for the later rebuild:

1. `src/pages/homepage/HomepageShowcases.tsx` — named section/rail exports and one shared profile-preview controller, composed from real existing pieces. Splitting into one file per section is not necessary initially.
2. `src/pages/homepage/homepage.css` — homepage-scoped editorial rhythm, grids and responsive rail styles. Keep the app tokens and existing guided-demo CSS stable.

Continue using Home.tsx as the page orchestrator, enquiry owner and owner of `previewFrame`. Existing private/provider-coupled presentation may need small prop/export extractions **in its original files** (ComparisonTable, CandidateOverviewCard, DiscussionEditor); preserve app defaults, mutations and tests. These are proposed limited changes, not existing preview APIs. Do not create replacement models or a new application to avoid a small extraction.

An additional `HomepageWorkspacePreview.tsx` is optional only if a distinct persistent expansion/return controller is approved; simply moving section 07 does not require it. It must not conceal an iframe remount or create another editable state island. Keep the current separate GuidedDemo unless deliberately repairing its lifecycle.

Proposed new current tests, genuinely needed for the rebuild: `tests/e2e/current/homepage-showcases.spec.ts` and `tests/e2e/current/homepage-demo-integration.spec.ts`. Neither is created in this run.

## 7. Guided/embedded risks and acceptance gates

| Priority | Finding | Required mitigation in later work |
|---|---|---|
| P1, runtime verified | Fresh guide Next changes its narrative to Candidates while the iframe displays Overview. GuidedDemo changes iframe src without satisfying AssignmentFlowProvider’s unlock state. | Align guide navigation with actual in-frame workflow/actions, or use an explicit demo entry protocol that does not silently bypass review. Likewise verify Discussion unlock. Do not fake the guide heading while showing another page. |
| P1, source verified | Guide dirty checks query `.workspace-edit-status, .workspace-discard-guard`; the current Discussion header renders Unsaved changes in a status span without those classes. | Use an explicit typed frame status/guard protocol or verified stable current marker. Protect host links, guide close/back/next, browser Back, expansion and return; test save/discard/cancel. |
| P1, runtime verified | Shell Back to website inside guided iframe loads the marketing page inside that frame and leaves the host guide open. | Same-origin, validated parent/child return event: ask the child’s dirty guard first, then close/restore the host. Preserve normal `/` link behavior when the app is standalone. |
| P1, source verified | Each guide stage is a keyed iframe replacement. Saved storage is shared, but dirty editing buffers are not. | Keep a persistent guided frame/router navigation channel or enforce a correct guard before replacing frames. Do not promise seamless inline/fullscreen state continuity from shared localStorage alone. |
| P1 | Multiple same-origin providers/frames can save conflicting versions, consume notifications or reset one another. | Keep live state in section 07; pure fixtures elsewhere; maintain revision checks/conflict recovery and deliberate reset. Never reset on feature selection or guide launch. |
| P2 | `preview=1` currently does not set WorkspaceHome’s preview prop. | Treat the existing embed as the full live app, not an already-isolated preview. Define any presentation-only mode explicitly and test it before relying on it. |
| P2 | Four new explanation stages differ from the three real app steps and old guide stages. | Separate narrative rail state from actual workflow state; explain the final review action without changing the app’s step count. |
| P2 | Historical guide/iframe tests are excluded from the current suite and reference old fields/names. | Adapt/promote relevant cases into current tests. Existing green marketing-hero/app tests do not prove current guided integrity. |
| P2 | DOM key handlers can affect Escape/Tab across a frame, nested profiles and host modal. | Test inner modal closes before outer guide, keyboard traversal across frame boundaries, focus return and host scroll restoration. |
| P2 | Restored/completed demo state changes the initial dashboard and available actions. | Test fresh, partial, dirty, completed and reset states. Never force seed state just to make the marketing frame look pristine. |
| P2 | Sample metrics, old trust/guide “not sent” copy and fake enquiry success can be mistaken for real service proof/delivery. | Apply the brief’s evidence rules, adjacent fictional labels, accurate local-submission wording and current contact limitations. |

The isolated read-only Chromium probe used a fresh context at 1440px/reduced motion and wrote only a temporary script outside the repository. Observations: initial guide Overview worked; fresh Next gave guide Candidates/actual Overview (1 overview, 0 candidate pages); in-frame Website rendered Home inside the frame; Skip demo closed the overlay and restored focus to its trigger. Dirty-marker and remount findings above are source-level findings, not a claim that a full dirty-edit browser scenario was exercised in this run.

## 8. Assets and metric policy

Existing assets are sufficient for the requested hero: `public/videos/leadership-office.mp4` (~8MB), `leadership-conversation.mp4` (~5.7MB), their JPEG posters (~175/193KB); company `public/brand/mandate.svg`; product `mandate-studio.svg`/`mandate-studio-icon.svg`. No new stock imagery or AI-generated hero asset is needed.

`public/avatars/claire-bennett.jpeg`, `public/avatars/marcus-reed.png`, `public/avatars/daniel-foster.jpeg` and `public/company-logos/*.png` support the real profile previews. Existing `public/process/*.png` and `docs/qa/` captures are historical evidence, not a substitute for current authentic interactive components. Several images predate the latest app layout and can mislead if used as final product imagery.

Invented performance-like numbers are in `src/features/ExecutiveDashboard.tsx`, exposed through Home’s iframe: $250K/+10%, 128 sector candidates, 18 searches (12/6 split), and readiness percentages. The current marketing prose has no firm testimonial/placement/success-rate claims. Keep scenario facts (two acquisitions/12 locations/60 days) distinct from firm proof. Do not duplicate dashboard metrics in the new sections. See the companion brief for the literal no-metrics-versus-dashboard-reuse decision.

## 9. Implementation order and dependencies

1. Preserve the dirty worktree and capture current routes/behaviors. Add current guided/embedded regression cases before touching section 07. Resolve its P1 handoff/dirty/unlock gaps as scoped fixes, not a new router/application.
2. Lock the brief’s eight-section outline and desktop/mobile wireframe. Use the supplied reference and existing brand; research full Concourse section patterns before asserting new reference-specific details. Keep the current hero/media/header behavior; change the hero secondary CTA to Explore sample workspace in that later run.
3. Expose only the presentational hooks/props needed from the existing brief, card/table and discussion renderer. Verify app defaults remain identical. Dependency direction: domain data/functions → shared product presentation → homepage showcases; live session/providers remain owned by the actual demo.
4. Compose section 02’s three real-component cards, then Living Mandate, Candidate Evaluation and Discussion Brief using those same pieces. One shared candidate drawer; no repeated full App mounts.
5. Add the four-stage selectable/sticky rail using existing previews. Keyboard selection is required; sticky behavior must release on mobile if it obscures content. Selection does not advance/reset the demo.
6. Move/reuse the current working-preview + GuidedDemo section as section 07, keeping its iframe/ref stable. Implement any approved expansion/parent return protocol and test dirty state through each transition.
7. Retain the existing final-conversation/contact entry as section 08, remove or merge obsolete/repetitive inline sections, and preserve `#our-process`/`#challenges` anchor targets (or deliberately update every corresponding nav link). Do not remove the completion CTA’s `/?conversation=1` route.
8. Rendered QA at 1440/390 plus 320/768; keyboard, reduced motion, contrast, text enlargement, feature controls, iframe/history/focus, actual editing and the full completion/restart cycle. Review the broader app for CSS leakage, then run the required checks.

## 10. Test commands and existing coverage

From the workspace root:

```sh
pnpm dev --host 127.0.0.1 --port 5173 --strictPort
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
pnpm test:e2e
pnpm test:preview
pnpm check
```

`pnpm check` runs lint → typecheck → unit → build → e2e → preview. `pnpm format` writes broadly across TS/TSX and is inappropriate for this audit or a scoped homepage pass.

Current Playwright coverage: `tests/e2e/current/marketing-hero.spec.ts` (video sequence, pause/reduced motion, company logo, mobile menu, enquiry), `workflow.spec.ts` (app profiles/editor/review/completion/site conversion/restart and submitted homepage state), `mobile-assignment-pager.spec.ts`, `design-system-accessibility.spec.ts`, `assistant-composer.spec.ts`, `home-notification.spec.ts`, `toast.spec.ts`, plus `tests/e2e/production.spec.ts`.

`playwright.config.ts` includes current tests plus production smoke at port 5173. `playwright.preview.config.ts` checks the production build at 4173; build first. HTML reports and failure artifacts are written under `docs/run/mandate-studio-v2/evidence/`. Avoid writing source/Markdown/report HTML while another live browser run uses Vite: reloads can invalidate an editor test. Do not run overlapping suites into the same report directory.

Historical integration references (not current acceptance tests): `tests/e2e/v2-deep-behavior.spec.ts`, `v2-preview-guard.spec.ts`, `v2-refinement.spec.ts`. The legacy config excludes current/production tests and retains older selectors/fields. To inspect explicitly:

```sh
pnpm exec playwright test --config playwright.legacy.config.ts tests/e2e/v2-deep-behavior.spec.ts tests/e2e/v2-preview-guard.spec.ts
```

Do not assume this old suite passes or add exclusions to conceal failures. New homepage integration tests must reflect the current contenteditable editor, step gating, candidate names, company/product branding and completion actions.

This documentation run did not run lint/build/full browser suites, because there are no UI/code changes and those runs write artifacts. It performed source inspection, a targeted read-only browser probe and a final content-hash preservation check. Prior recorded green checks are historical evidence, not a new all-tests-pass claim for this run.

## 11. Handoff decisions and blockers

No blocker prevented creating this audit and contract. Before later acceptance of the rebuild:

- Fix the verified guide stage/return gaps and the stale dirty-state contract; they block a claim that section 07 preserves the intended guided/return behavior.
- Specify whether expansion means the existing separate near-full-screen guide or true same-instance inline expansion. There is no existing same-instance expansion implementation to simply restyle.
- Resolve strict no-invented-metrics wording against reuse of the example dashboard; default recommendation is explicit fictional labeling and no marketing reuse of its numbers.
- A real prospective-client contact endpoint/calendar/email is not configured. Keep the honest existing demo enquiry until a destination is supplied; no fabricated integration.
- Full live Concourse page research and physical-device/screen-reader validation are not completed by this repository audit. Existing assets support the hero now; these are verification steps, not a request to replace supplied media.

Stop after these two documents. No homepage coding, component extraction, state migration, dependency install, reset, staging or commit in RUN-MANDATE-HOME-00.
