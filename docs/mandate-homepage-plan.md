# Mandate homepage implementation plan — HOME-08 completion

## HOME-08 current implementation (supersedes historical status below)

All seven sections are implemented in the approved order: Hero → Leadership challenges → Product value → Our approach → Technology and judgment → Interactive demo → Final CTA. The HOME-03 strategy below remains authoritative; its “later run” and unresolved-guide statements describe the historical starting point, not current implementation status.

- Hero retains the subsequently approved shorter body: “Executive-search advice for growing organizations. Supported by a connected workspace that keeps priorities in focus.” Navigation now consistently uses Leadership challenges / Our approach / Mandate Studio / Request a conversation.
- ProductValue, OurApproach and TechnologyJudgment reuse read-only interface excerpts, without independent business state. InteractiveDemo and GuidedDemo own the single persistent workspace iframe; HOME-07 resolved same-instance expansion, real step availability, dirty buffers, nested overlays, focus restoration and return to website. See `docs/qa/2026-11-13/home-07/README.md` for functional evidence and remaining limitations.
- HOME-08 replaces the remaining obsolete questions/closing content with `src/pages/homepage/FinalConversation.tsx` and scoped `final-conversation.css`. Final copy: “Let's find the leadership your next chapter needs.” Actions: Request a conversation (existing local preview dialog) and Explore Mandate Studio (`#sample-workspace`, never a locked deep link).
- Footer uses the company Mandate logo, the same section anchors and contact action, plus prototype notes/design process and explicit fictional-data/no-delivery disclosure.
- No live contact destination exists. The dialog validates sample information locally, labels its action “Preview contact request”, and confirms “No inquiry was sent or saved.” No endpoint, submission, delivery or storage is invented. The completion `/?conversation=1` entry remains supported.
- No application routes, workflow, data, editor or reset behavior are changed in HOME-08. Existing unrelated worktree changes remain outside this run.



## Governing strategy and supersession

**This plan supersedes the old eight-section implementation/content plan.** Follow `docs/mandate-homepage-brief.md`: Hero → Leadership challenges → Product value → Our approach → Technology and judgment → Interactive demo → Final CTA. Do not continue building individual scenario walkthrough sections under the old contract.

The original audit/plan is retained in `docs/archive/mandate-homepage-plan-home-00.md` for technical inventory and evidence. Its section numbers, suggested narrative, Pause/Play requirements and future-work status are historical. HOME-01/02 implementation is preserved and evolved, not restarted.

## Current repository and page

Existing React/TypeScript/Vite application with React Router, local Inter, semantic tokens, reusable dialogs/buttons and Playwright/axe coverage. Home.tsx owns navigation, enquiry and the stable previewFrame ref. The worktree contains substantial prior modified/untracked work: do not restore, clean, broadly format, stage or commit unrelated files.

Implemented files:

- `src/pages/Home.tsx`: page orchestration, hero/navigation, existing legacy lower sections, one workspace iframe and GuidedDemo, enquiry.
- `src/pages/homepage/homepage.css`: landing-scoped containers/type/spacing plus hero/header refinements from HOME-01.
- `src/pages/homepage/HomepageShowcases.tsx`: LeadershipChallenges and lightweight presentational adapters from HOME-02.
- `src/pages/homepage/leadership-challenges.css`: scoped three-card visual layout and mobile stacking.
- `src/components/MarketingHeroVideo.tsx`: supplied two-clip playback, hidden-tab pause, failure handling and static reduced-motion fallback; visible control subsequently removed at user request.
- `src/pages/marketing-v2.css`: earlier marketing/guide styles; `src/theme.css` / `src/index.css`: incumbent shared tokens and foundation. Do not rewrite them for this strategic run.

The existing DOM still contains the early live dashboard, legacy approach/example/evidence/trust sections and final CTA. These await the later section runs. Keep them working during HOME-03; their temporary order/scenario copy is not the final architecture. The eventual scenario belongs only inside section 06. Its relocation and legacy content cleanup must be delivered with the later replacements, not disguised as new sections in this run.

## HOME-03 scope and decisions

1. Update the two governing documents and archive their superseded versions.
2. Use **The right leadership for what comes next.** It communicates the broader executive-search proposition directly. Update only hero copy; retain media, visual composition, CTA labels/destinations, mobile menu and enquiry.
3. Keep section 02's existing headline/intro and three substantial cards. Broaden titles to Growth & scale / Acquisitions & transformation / Critical leadership transitions. Preserve styling and responsive behavior.
4. Replace rendered Northline requirements and named availability rows with clearly identified capability illustrations using the same preview framing, typography, fields and New tag. No fabricated client data, candidate results, metrics or functional-looking controls.
5. Preserve and export the source-derived RequirementsPreview and AvailabilityPreview adapters for possible later reuse inside the dedicated demo. Do not render them in section 02. Domain records and comparison logic remain untouched.
6. Update existing homepage tests for the preferred headline, broad positioning and absence of scenario facts in section 02. Verify layout, controls, anchor navigation, media/reduced motion and automated accessibility.
7. Stop. No new Product value, Our approach, Technology and judgment, Interactive demo or Final CTA section implementation.

## Future section implementation order (requires later runs)

| Stage | Content and reuse | Boundary/dependency |
|---|---|---|
| 03 Product value | Evolving brief, structured discovery/comparison, evidence/uncertainty, connected human-reviewed documents. Reuse the existing read-only product-concept presentation. | General capability illustrations without fictional case records or invented results. Avoid extra providers. |
| 04 Our approach | Advisory understanding → relevant experience → useful discussion → human review. Reuse typography, section/container utilities and suitable existing explanatory content. | Replace old scenario-heavy approach markup; preserve #our-process anchor. No app workflow/step changes. |
| 05 Technology and judgment | AI assistance, editing, saved versions and human judgment; transparent limitations. | Replace obsolete trust/evidence prose. “Sent for review” in the prototype is simulated local state, not actual delivery/approval. |
| 06 Interactive demo | Move/reuse the one existing working-preview, iframe/ref and GuidedDemo later in the narrative. This is the only place for Northline, Head of Operations, two acquisitions/12 locations/60 days and named candidates. Reuse actual source-derived previews if useful here. | Add current integration regression coverage and resolve risks below before claiming reliable expansion/return. Preserve #sample-workspace, saved/dirty state and host scroll/focus. Remove remaining scenario records from legacy marketing sections as replacements land. |
| 07 Final CTA | Request a conversation and Explore sample workspace, using current honest enquiry and sample anchors. | No invented contact backend, commercial proof or additional scope. Keep /?conversation=1 conversion entry from app completion. |

Alternate dark/light sections deliberately during those builds; do not apply a new color system. Keep substantial product illustrations alongside an advisory narrative, not a second demo spread across the page.

## Shared application inventory and dependencies to preserve

- Routes in `src/App.tsx`: `/`, `/workspace`, `/workspace/home`, `/workspace/assignment`, `/workspace/candidates`, `/workspace/discussion`, `/workspace/completed`, `/workspace/experts`, `/process`, `/prototype-notes`, fallback.
- `WorkspaceProvider.tsx` / `WorkspaceV2Provider.tsx`: revision/conflict/recovery and candidate/detail/workflow preferences. Local records `mandate-studio:v1` and `mandate-studio:v2:preferences`. Do not clone provider islands for marketing art.
- `src/domain/{v2,client-brief-content,model,candidate-directory,candidate-profile-details,comparison,comparison-sources,discussion-document}.ts`: source of truth for actual demo facts, comparisons and documents. Marketing concepts are explanatory copy, not an alternative data model.
- `ClientBriefDocument.tsx`, `MandateVersions.tsx`, `FieldHistory.tsx`: real source/history presentation. `src/features/Assignment.tsx`: reviewed/editable assignment; preserve fresh-review requirements.
- Candidate cards/full-profile drawer and comparison components, `src/features/Discussion.tsx` and editor/version components: reuse their actual presentation/logic only in appropriately isolated demos; preserve source focus and edit guards. See archived inventory for exact component/export boundaries.
- `AssignmentComplete.tsx`, `use-assignment-submitted.ts`, RecoveryNotice/ResetSample and Shell: deliberate reset, persistence, submitted-home state, website conversion and app navigation.

Dependency direction: product domain/shared presentational components → appropriate demo presentation; homepage illustration/copy → read-only rendering. Homepage selection must not mutate app progress. Home remains the enquiry/embed owner. No new production files or dependencies are required in HOME-03; reuse HomepageShowcases and existing styles.

## Known demo risks (not repaired in HOME-03)

Prior HOME-00 source/runtime findings remain open pending the later demo run:

- Fresh GuidedDemo Next can narrate Candidates while its frame remains on locked Overview.
- Dirty checks query obsolete `.workspace-edit-status, .workspace-discard-guard` markers; current editor status differs.
- Website inside a MemoryRouter iframe loads Home inside that frame rather than returning to the host.
- Keyed guide iframe replacement loses unsaved buffers; shared localStorage preserves saved state only.
- `preview=1` does not currently wire WorkspaceHome's preview prop; treat it as a live instance.
- Multiple same-origin frames/providers can affect notifications, versions and resets. Preserve conflict protection.
- Existing expansion is a separate near-full-screen guided frame, not same-instance inline expansion. Do not claim seamless continuity without implementing/testing it.

Later acceptance must cover fresh/partial/dirty/completed/reset storage; guide unlock and actual content alignment; save/discard/cancel; nested Escape; focus/scroll restoration; host return and retained editing state. Existing green homepage tests do not establish all these guarantees.

## Evidence, assets and destinations

Keep current company/product logos and supplied optimized videos/posters. No stock photographs, generated client marks or new font/palette needed. Supplied portraits/employer logos and dashboard metrics belong only to the labeled demo. No invented placements, testimonials, client relationships, success rates or commercial outcomes.

The existing Request a conversation form validates synthetic data and acknowledges locally; no real contact endpoint/calendar is configured. Preserve this behavior and limitation. Do not imply independent candidate verification, live search or real manager delivery.

## Validation commands and scope

```sh
pnpm lint
pnpm build
pnpm exec playwright test tests/e2e/current/homepage-challenges.spec.ts tests/e2e/current/marketing-hero.spec.ts
pnpm test:preview
```

Build includes TypeScript checking. Focused tests cover 1440/1024/390/320 section layouts, scenario-free marketing illustrations, hero copy, mobile menu, valid anchors, video sequencing, static reduced motion, enquiry and automated A/AA checks. Inspect rendered desktop/mobile screenshots; preserve screenshot evidence from prior runs by writing HOME-03 captures separately.

Broader checks remain available as appropriate: `pnpm typecheck`, `pnpm test:unit`, `pnpm test:e2e`, `pnpm check`. Add/promote guide integration coverage during section 06 work; legacy guide suites use outdated selectors. Do not run overlapping browser suites into the same report folder or edit source during a suite (Vite reloads can invalidate editor checks).

Record actual results in `docs/qa/2026-11-13/home-03/README.md`. HOME-03 does not claim completion of the new seven-section page, repairs to known guide risks or production contact delivery.
