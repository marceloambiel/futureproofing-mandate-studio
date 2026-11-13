# HOME-05 — Our approach

Scope: replace the old #our-process section with the supplied broad advisory copy and four presentation stages. The new section follows Product value, preserving the navigation anchor and intended dark-to-light rhythm. The old scenario-heavy approach example is removed; no other sections or working app files are altered.

## Reference lock and structure

Continue the Concourse-inspired editorial direction inspected in HOME-04: restrained copy, generous typography and substantial light product panels. This run adds the explicitly requested sticky/selectable stage behavior; it is not a claim that an uninspected competitor interaction was copied. Existing Mandate fonts, palette, focus styles and product-excerpt presentation remain authoritative.

Desktop: introductory copy above a sticky vertical selector (96px from the top, clearing the 64px website navbar) and a large active product preview on the right. Mobile <=900px: a compact two-column selector, active-stage description and readable stacked interface excerpt. All four stages remain available; nothing depends on hover/drag. Tabs support arrows, Home/End, pointer selection and visible focus, with labelled panels and one active tab stop. Preview entrance is 180ms/4px and disabled for reduced motion. Desktop preview space is stabilized to avoid unnecessary section jumps.

## Reuse and isolation

ProductValue.tsx exports the existing BriefShowcase and DiscussionShowcase. Its existing combined candidate visual is split into CandidateMatrixPreview and CandidateProfilePreview with equivalent DOM; Product value continues to compose both. OurApproach reuses those four renderers. Explore adds only a small read-only discovery overview; Evaluate reuses the matrix. Advise retains the existing illustrative document and human-review-required state.

All excerpts use anonymized illustrative copy. No named candidates/client, role-specific challenge values, matching/business logic, app workflow changes, storage, providers or additional iframe are introduced. Only a local presentation index chooses the displayed stage. Existing brief version controls retain their local illustrative behavior from HOME-04. The four marketing stages do not replace the application's three workflow steps.

## Commit boundary

Stage only OurApproach.tsx, our-approach.css, homepage-approach.spec.ts, QA evidence, the preview export/refactor changes in ProductValue.tsx, and Home.tsx's approach replacement/import cleanup. Exclude preceding sticky-navbar, hero and other uncommitted changes through an index-only scoped version of the integration files. Keep their working-tree contents intact.

## Validation

Passed:

- `pnpm lint`.
- `pnpm build` (TypeScript + Vite), including the final presentation copy.
- Five approach cases: four viewport sizes (1440/1024/390/320) exercise every stage, panel linkage, pointer/arrow/Home/End selection, visible keyboard focus, desktop sticky offset, no overflow/clipped previews, no scenario facts and one existing iframe only; a separate case verifies reduced-motion behavior.
- Eight existing hero/navigation/sticky-theme cases passed; four existing Product value cases passed after the shared preview refactor.
- `pnpm test:preview` — production route and asset smoke passed against the final build.

The initial accessibility snapshots occurred during the 180ms opacity entrance. Scans now wait for the animation to finish instead of measuring an intermediate frame; no accessibility rules are disabled. All 16 stable stage/viewport combinations returned zero automated WCAG A/AA violations. Anchor checks also wait for smooth scrolling to finish.

Rendered review includes desktop/mobile overall layouts, Explore discovery/profile and Evaluate matrix. Captures of every stage at 1440/390 accompany the four overall layout captures. Fixed global navigation and the offscreen skip link are hidden only in element screenshots to avoid capture artifacts; their real functionality/contrast is tested separately. [Desktop layout](approach-1440.png), [mobile layout](approach-390.png), [Explore](preview-explore-1440.png), [mobile Evaluate](preview-evaluate-390.png), [Advise](preview-advise-1440.png).

No section-specific blockers. Previews remain disclosed read-only illustrations. This run does not repair the previously documented guided-demo integration issues or configure a production contact endpoint. No app component, route, provider, storage key, candidate/business rule or workflow step was modified.
