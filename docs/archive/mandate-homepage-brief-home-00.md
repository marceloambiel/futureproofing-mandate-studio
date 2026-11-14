# RUN-MANDATE-HOME-00 — Homepage implementation contract

Status: repository audit and implementation brief only. No landing-page or demo UI changes are authorized in this run.

## Project and audience

Upgrade the existing Mandate landing page for the FutureProofing prototype challenge. This is a targeted homepage rebuild, not a new application, router, design system, search engine, CRM or backend.

Mandate is the executive-search advisory company: **clarity through change**. Mandate Studio is its demo product. Prospective clients should understand the advisory approach, see how a changing business need affects a search, and either request a conversation or explore the working sample.

Preserve the company wordmark (`public/brand/mandate.svg`) on the website and the product wordmark (`public/brand/mandate-studio.svg`) in the demo. Preserve the current near-black icon gradient with its small CTA-yellow tip, and intentional white/monochrome versions.

## Original challenge: the source of the story

A fictional executive-search firm has a Head of Operations assignment. Its client brief changes from geographic expansion to integrating **two acquisitions across 12 locations**, with a **60-day availability target**. Show the revised assignment, three candidates, an editable client discussion document, and readiness for human review.

The existing sample is Northline Integration Search for Northline Services Group. Candidates are Claire Bennett, Marcus Reed and Daniel Foster. Their supplied availability is 30, 45 and 90 days. These are fictional scenario facts, not Mandate business results or independently verified candidate evidence.

AI matching/generation in this prototype is simulated using local data and document-generation functions; review/submission is local demo state. Do not imply live candidate sourcing, independent verification, actual manager delivery or approval.

## Ordered homepage content contract

These eight sections, headlines and purposes govern the later implementation. Preserve the punctuation and meaning; line breaks may adapt to the viewport.

| Order | Section and headline | Required content and behavior |
|---|---|---|
| 01 | **Hero — “The business has changed. What should its next leader bring?”** | Introduce an executive-search advisory approach. CTAs: **“Request a conversation”** and **“Explore sample workspace”**. Keep text/actions centered over the supplied sequential video background, with a dark readability overlay and clean dark glass navigation. |
| 02 | **Leadership challenges — “Leadership needs don't stand still.”** | Exactly three feature cards: **Growth & scale**, **Acquisition integration**, **Time-sensitive appointments**. Each must showcase a relevant real application component, rather than a decorative fake dashboard. See the component mapping in the implementation plan. |
| 03 | **Living mandate — “When priorities change, the search should change with them.”** | Show the current and previous client brief, changed priorities, structured requirements, editing/revision concepts, timestamps/version context and the need for fresh review after edits/restoration. |
| 04 | **Candidate evaluation — “The right decision starts with the right questions.”** | Show candidate discovery, the real profile drawer, criterion-level match/attention/unknown evidence states and the comparison matrix. Include unmet requirements where applicable. Explain limitations and questions, not a ranked winner. |
| 05 | **Discussion brief — “From evidence to a conversation worth having.”** | Show the AI-generated discussion brief, human editing, saving versions and preparation for board review. Retain the distinction between saved, ready/sent for review and approved. Marketing copy can describe board-review preparation; do not silently relabel the app’s existing manager-review state. |
| 06 | **How an assignment works — “A clearer path from brief to review.”** | Four stages: **Review the assignment; Explore candidates; Prepare the discussion; Send for review.** Use a sticky or selectable feature rail and authentic product previews. These are four marketing explanation stages, not permission to turn the app’s existing three workflow steps into four. |
| 07 | **Interactive dashboard — “A changed priority. A clearer discussion.”** | Reuse the actual dashboard iframe and current guided-demo entry, expansion/return intent and reset logic. Preserve saved/unsaved work, navigation, focus and website scroll position. Resolve the verified integration gaps below before declaring this behavior complete. |
| 08 | **Final CTA — “Start with the leadership question.”** | Offer a clear prospective-client contact route and a sample-workspace route. Reuse Request a conversation and the existing sample entry. A production contact destination is not yet supplied; the current enquiry explicitly remains a demo. |

## Editorial and evidence rules

- No fabricated placements, testimonials, customer endorsements, success rates, client logos or business-performance claims.
- Never describe an entire candidate as a “perfect match.” Criterion-level match labels must state which evidence/requirement they address.
- Keep documented, candidate-described, unmet, unknown and to-confirm states distinct. Convert missing evidence into questions; do not erase uncertainty for marketing polish.
- Keep sample labels adjacent to product showcases. Supplied portraits/company logos represent fictional demo profiles/employers, not testimonials or customer proof.
- Reuse `src/domain/v2.ts`, `client-brief-content.ts`, `model.ts`, `candidate-directory.ts`, `candidate-profile-details.ts`, `comparison.ts`, `comparison-sources.ts` and `discussion-document.ts` as the content/logic sources. Do not create a second set of candidate scores, brief history or review rules.
- The existing webpage’s trust copy that says readiness never means “sent” is stale relative to the app’s Send for review UI. Later copy must explain **local simulated submission, with no real delivery or approval**, rather than contradict the product or claim production delivery.

## Invented numbers already exposed by the page

The marketing prose itself has no firm placements/testimonials/success-rate claims. However, the embedded `/workspace?preview=1` renders `src/features/ExecutiveDashboard.tsx`, which hardcodes:

- **$250K placement value; +10% year to date**, with a fabricated January–May fee series (225, 233, 250, 254, 250 thousand).
- **128 candidates by sector**: Technology 48, Healthcare 24, Industrials 32, Consumer 18, Financial services 6.
- **18 executive searches; 12 completed and 6 in progress**.
- Readiness segment percentages: brief alignment 10/15/60/15, shortlist quality 5/20/65/10, availability 10/30/45/15.
- Two additional fictional blocked assignments in the current-assignment list.

These are demo fixtures, not observed business data. Do not lift them into marketing proof, counters or claims. Section 07 must explicitly identify the retained dashboard as fictional sample data immediately next to the embed. If “no fabricated business metrics” is intended to prohibit even labeled example charts, the exact dashboard reuse requirement conflicts with that reading: obtain a scoped decision about hiding/replacing those chart previews before implementation acceptance. Do not alter the app’s numbers in this documentation run.

The 12 locations, two acquisitions and 60-day target are original scenario requirements. Fictional client-company revenue/headcount or CV facts in the sample documents are also not Mandate performance claims.

## Visual direction and reference lock

Dominant direction: premium editorial executive search, using Concourse-inspired dark/light rhythm, restrained navigation, substantial feature-card grids and product-led showcases. The previously supplied Concourse screenshot is evidence for the video hero and dark glass navigation; the full live Concourse site was not newly inspected in this repository audit. Treat broader section-rhythm/grid requirements as the user’s direction, not as a claim of inspected reference screens. Do not clone competitor branding, content, customer logos or announcements.

Preserve Mandate’s current colors and identity: CTA #F9DB74 with dark #292C29 text; page #F9F9F8; white surfaces; dark #2E322E focus areas; restrained semantic chart/tag hues. Reuse semantic tokens from `src/theme.css`, Tailwind mappings in `src/index.css`, Inter Variable from the local font package, and the document-specific Arial stack. Do not introduce a new font/palette solely to appear editorial.

The hero already supports the reference: `MarketingHeroVideo.tsx` plays the supplied 13.097s office clip then the 8.4s conversation clip, repeating; optimized 720p files total roughly 14MB. Preserve muted inline playback, Pause/Play, static reduced-motion posters, hidden-tab pause and failure fallback. Keep sufficient overlay contrast over both clips and mobile crops.

Website CSS must be scoped to the marketing homepage. Preserve the demo’s separate desktop and mobile rules in `docs/DESIGN_SYSTEM.md`: dark desktop assignment column; three-step desktop milestones; mobile current-step pager/swipes, persistent summary state, document previews, floating CTAs, profile drawers, full-width editor and reset/completion behavior. Do not propagate website rhythm/type/background changes into `.app-shell` or shared application tokens.

## Functional guardrails

- Preserve `/`, `/?conversation=1`, `/workspace`, `/workspace/home`, `/workspace/assignment`, `/workspace/candidates`, `/workspace/discussion`, `/workspace/completed`, `/workspace/experts`, `/process`, `/prototype-notes` and the fallback route.
- Keep Request a conversation wired to the existing enquiry dialog/validation; `/?conversation=1` is also used by the demo completion CTA. The form currently sends nothing. Do not fabricate a contact endpoint, calendar link or success message implying real delivery.
- Default sample CTA should enter `/workspace` (or an explicitly supported guided entry), not bypass locked Candidates/Discussion routes.
- Keep both persistence records and their revision/conflict/recovery behavior intact: `mandate-studio:v1` and `mandate-studio:v2:preferences`.
- Do not automatically reset on page load, guide open, feature selection, expansion or return. Reset must remain deliberate and clear both records via the established session/preferences methods.
- After simulated submission, Northline must stay out of the current list, with its separate Sent for review summary; preserve reload persistence and final-screen conversion/restart/view actions.
- Keep one real embedded workspace in section 07; do not mount a complete application/provider pair in every showcase card.
- No homepage edit should change core candidate inclusion/removal, evidence links, brief revision/history, document sanitization, dirty-edit protection, saving or review readiness.

## Accessibility and responsive acceptance

Retain semantic landmarks/headings, meaningful image/button names, visible focus and keyboard access. Verify text/graphics contrast on both dark and light sections, 200% text sizing/custom spacing, 320px reflow, appropriate touch targets, reduced motion and video pause. Real table scrolling is allowed; page-wide overflow and clipped dialogs are not.

Desktop: product previews can use a large editorial grid and sticky selectable rail. Mobile: stack the narrative, use an accessible selectable rail without relying on hover/drag, constrain preview heights, and open the real profile/document views without nested-scroll traps. Decorative cropped previews require a labeled way to reach/read the full content.

Section 07 acceptance specifically includes fresh and completed storage, guide order matching the visible app step, safe close/Escape/backdrop/navigation with unsaved edits, nested-modal Escape, focus/scroll restoration, return from inside the embed to the actual host website and intentional reset. Existing code does not currently prove all of these guarantees.

## Run boundary

This run creates only this brief and `docs/mandate-homepage-plan.md`. No homepage, demo, shared component, asset, dependency, lockfile or router changes. Future implementation needs a separate authorized run. Preserve the existing dirty worktree; do not revert, stage or commit it as part of this audit.
