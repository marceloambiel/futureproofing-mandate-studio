# HOME-04 — Product value

Scope: the new Product value section immediately after Leadership challenges. No other sections are replaced, moved or removed. All requested section/feature copy is used verbatim. Existing app source/domain/state and its routes are unchanged.

## Design lock

Concourse https://www.concourse.ai/ inspected on 2026-11-13: its dark modular product area places a large light interface stage beside editorial copy, with generous space and strong hierarchy. Its dynamic preview was partly unloaded in the browser capture. Borrow the modular light-on-dark composition and proportions, not competitor assets, brand or copy. Mandate's existing dark focus palette, Inter, yellow CTA system, white document surfaces and 16px feature corners remain authoritative.

Wireframe: dark heading/intro → wide brief/document/requirements/history excerpt with copy left → reversed, wider comparison/profile excerpt with copy right → taller editor/document excerpt with copy left → concise illustration disclosure. Below 1100px copy precedes each preview; below 650px internal document/sidebar and comparison/drawer layouts stack. All text remains readable without screenshot scaling, clipping or nested scrolling.

## Authentic UI boundary

The existing ClientBriefDocument hardcodes the fictional client/role, CandidateFullProfile and ComparisonTable are tied to supplied profiles/providers, and DiscussionEditor/history are private/provider-coupled. Mounting them directly would expose the scenario or duplicate live app state. This run leaves those working components untouched.

`src/pages/homepage/ProductValue.tsx` therefore uses read-only anonymized presentation adapters preserving their recognizable DOM/class roles and structure:

- ClientBriefDocument's paper/header/body, structured fields and a two-version history selector. The selector really switches local illustrative content; it never restores or persists an app version.
- CandidateFullProfile's header/profile-section strip/career/question structure alongside ComparisonTable's semantic criteria/evidence matrix. The shared app `EvidenceLabel` is reused directly for uncertainty labels. No candidate records, scores or match logic are invented.
- Discussion's single-line toolbar/document/numbered-section presentation; a static read-only editor excerpt, with no misleading save/formatting actions, contenteditable state or copied editor commands.

Illustration/read-only disclosures are adjacent. Names, clients, role-specific case data, target timings and fictional business metrics are absent. There are no stock photographs, generic decorative icons, new providers, iframes, backend calls, dependencies or business rules. The actual editable workflow remains available through the existing sample entry.

## Files and commit boundary

ProductValue.tsx, product-value.css, homepage-product-value.spec.ts and this QA report are new scoped files. Home.tsx adds only the new import and component after LeadershipChallenges. Earlier homepage copy, navigation/hero refinements and untracked implementation are preserved and excluded from this run's commit by staging only the new integration lines against HEAD. The resulting commit is incremental to the supplied working tree; it does not attempt to checkpoint the entire unrelated app baseline.

## Validation

Passed:

- `pnpm lint`.
- `pnpm build` (TypeScript + Vite), rerun after the final layout refinement.
- 16 existing homepage/assignment checks passed in the combined run: four Leadership challenges cases, five hero/navigation cases, seven desktop/mobile workflow/reflow/profile/keyboard cases.
- `pnpm exec playwright test tests/e2e/current/homepage-product-value.spec.ts` — four final showcase cases passed at 1440, 1024, 390 and 320px. They verify exact feature headings, absence of case facts, local version switching by pointer/keyboard, read-only editor, one existing iframe only, no clipped interface/page overflow and zero automated WCAG A/AA violations.
- `pnpm test:preview` — production asset/deep-link smoke passed.

The first showcase run caught inherited full-screen profile geometry and excess document minimum height. Scoped excerpt sizing fixed both; a final explicit column-width rule prevents awkward mobile criterion breaks. No working-app CSS was modified. Desktop and mobile captures reviewed after correction: [1440](product-value-1440.png), [1024](product-value-1024.png), [390](product-value-390.png), [320](product-value-320.png).

No section-specific blocker remains. These are disclosed presentation adapters, not additional live copies of the application. Real editing, full profile navigation, evidence-source focus and manager-review preparation remain in the existing sample. Prior guide integration issues and the unconfigured production enquiry endpoint remain outside this section's scope.
