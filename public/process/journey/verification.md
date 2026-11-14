# MANDATE-PROCESS-001 — final handback and verification

Date: November 14, 2026. Route: `/process` (local URL `http://127.0.0.1:5173/process`). No deployment or submission was performed.

## Delivered

- Existing `/process` rebuilt as eight responsive editorial chapters: challenge, evidence, journey, interactions, website strategy, trade-offs, validation and reflection.
- 26 genuine fresh Chromium captures plus one exact historical artifact from commit `524e818`. Original screenshots retain their real proportions; full-size images and an optional evidence appendix make detailed UI readable. No fabricated before screen.
- Explicit central change: earlier demo-led homepage architecture becomes business value / approach / capabilities before one dedicated self-directed demo. Current and historical structures are labeled as source-derived diagrams.
- Meeting information order, material excluded from the opening, all three candidate-specific questions, historical approval safeguards, local simulation limits, and one proposed independent consultant study/4-of-5 target are included.
- Native process navigation, eight anchors/current-section state, keyboard/focus styles, responsive layouts, image loading and reduced-motion anchors. Existing website/workspace routes do not reset progress.
- User-authorized steering: fixed the website's vertical scroll stall while the pointer crosses the stacked comparison preview. Vertical wheel events now remain in Lenis; horizontal gestures stay native. Interrupted section anchors reset from actual scroll position and route their URL through React Router. This is the only homepage source change in this run; no visual redesign.

## Source revision and preservation

Starting/final git HEAD: `dd6a662dce28d51d7d1931d2e294a3f8b506cabc`, November 13, 2026, **plus the pre-existing dirty working tree**. This is not described as a clean HEAD build.

Final source identity: `f0a5e0d9eb0220c4912873ce02b45aecd888d237df31fa34ca27845e40affd99`. See `final-source-sha256.json` for the exact algorithm/per-file hashes and `baseline-source-sha256.json` for the starting source hashes. The only existing application source files changed from the run baseline are `src/pages/Process.tsx` and the user-authorized `src/pages/homepage/use-homepage-smooth-scroll.ts`. Product routes, providers, candidate records, editor and workflow source remain unchanged. New process files are listed below. Original Process.tsx is retained as `Process.before.tsx.txt`.

Supplied narrative was read in full and copied verbatim to `source.md` (SHA-256 `0a115b0ce9be0e92530c1771a464a187914c23ca0276eeaa7f66ca68903ca250`). Chronology was checked against git; no numbered prompt is claimed executed merely because it was written. The historical hero is the exact binary from `524e818:docs/qa/2026-11-13/home-01/hero-1440.png`. Its capture date is not inferred beyond its commit provenance.

No commit: a self-contained commit would require sweeping in existing untracked application dependencies/assets beyond this run. Unrelated changes were preserved; nothing was reset, deleted, staged broadly, published or submitted.

## Exact commands and observed results

| Command | Actual result | Evidence |
| --- | --- | --- |
| `node scripts/capture-process-journey.mjs` | Completed: 26 fresh captures in isolated synthetic-data contexts. Add/remove, document save, original-version restore/block, local review, completion/home and mobile save-return exercised through visible UI. | `capture-manifest.json` |
| `pnpm check` — first full attempt | Lint, TypeScript, 70/70 units and build passed; browser 82/90 passed, 8 failed. Process-page scan/test harness findings were investigated and corrected, not hidden. Preview phase was not reached because the command stops on browser failure. | `full-check-initial.log` |
| `pnpm check` — second full attempt | Lint, TypeScript, 70/70 units and build passed; browser 83/92 passed, 9 failed. Process 5/5 and asset/deep-link test passed in this sweep. This attempt preceded the final interrupted-anchor correction and the additional process reduced-motion test. Overall check was **not green**; see remaining findings. | `full-check-final.log` |
| `pnpm exec playwright test tests/e2e/current/process-journey.spec.ts tests/e2e/current/workflow.spec.ts tests/e2e/current/homepage-demo.spec.ts` | 19/19 passed. Real desktop/mobile assignment flow, all profile tabs, review/completion/reset, embedded full-screen entry, return and persistent progress. | `focused-check.log` |
| `pnpm exec playwright test tests/e2e/current/process-journey.spec.ts` | Final 6/6 passed. 1440/1024/390/320px layouts, eight chapters, image loading, no page-wide overflow, heading/link/keyboard paths, sampled axe rules, workspace-state preservation, reduced-motion anchors. | `process-page-final.log` |
| `pnpm exec playwright test tests/e2e/current/homepage-smooth-scroll.spec.ts -g 'crosses'` before fix | Failed as intended: 400px wheel input advanced only 48px after entering the table during inertia. | `scroll-stall-red.log` |
| `pnpm exec playwright test tests/e2e/current/homepage-smooth-scroll.spec.ts tests/e2e/current/homepage-card-stack.spec.ts` after initial fix | 7/7 passed, including the new crossing and horizontal-gesture regressions. | `scroll-stall-fixed.log` |
| `pnpm exec playwright test tests/e2e/current/homepage-smooth-scroll.spec.ts tests/e2e/current/homepage-card-stack.spec.ts tests/e2e/current/marketing-hero.spec.ts tests/e2e/current/homepage-demo.spec.ts` | Final 22/22 passed after the anchor-interruption correction. Includes the previously failing multi-anchor navigation test, desktop/mobile menu routes, Lenis/modal lifecycle and demo expansion. | `scroll-final-regression.log` |
| `pnpm lint` | Passed on final code. | `lint.log` |
| `pnpm build` | Passed on final code; includes TypeScript compilation. | `build.log` |
| `pnpm test:preview` | 1/1 production asset/deep-link smoke test passed, including `/process`. The image check now explicitly requests lazy assets during testing instead of requiring production eager loading. | `preview.log` |

The page's verification report and capture manifest are also served at `/process/journey/verification.md` and `/process/journey/capture-manifest.json`. The build is refreshed after packaging these notes.

## Remaining full-suite findings / limits

No claim that the full repository gate passed:

1. Existing desktop dashboard chart surfaces clip under the test's doubled text plus custom spacing (`design-system-accessibility.spec.ts`, 1440px). This was already documented before the run and remains outside this page's scope.
2. Two existing timeline assertions still require gray borders even though the approved website timeline now turns yellow with scroll.
3. Two existing mobile technology assertions still require four body-text lines, despite the approved full-width, naturally wrapping mobile design.
4. Three FAQ accessibility scans sampled the existing answer fade while text was partially transparent (reported contrast 3.45:1). This is outside `/process`; it is retained as an unresolved homepage-motion finding, not called a pass or dismissed as a proven harness error.
5. The full sweep's multi-anchor navigation failure was subsequently fixed in the same Lenis integration and passes in the final 22-test scroll regression. Earlier failing receipts remain in the logs.

The first process scan sampled a target partially under sticky navigation. Process targets now have scroll clearance; the final scan uses a stable reading viewport with disclosures present. Final keyboard paths and sampled scans pass. The first production asset check assumed all off-screen screenshots load eagerly; its harness now explicitly loads assets to check them, while production retains lazy loading. These corrections are scoped to this deliverable.

Automated Chromium and axe sampling does not certify WCAG compliance. No independent consultant study, physical-device testing, dedicated screen-reader session or Safari/Firefox pass is claimed. Contact/sign-in, local drafting/search/version/review simulations are not live backend, auth, AI or board delivery. The 4-of-5 comprehension criterion is proposed, not a measured result.

## Actual visual inspection

Reviewed the real rendered process hero, candidate evidence, journey, product-interaction chapter, strategic-change chapter, responsive comparison and final outcome on desktop and narrow layouts. Captures at 1440 and 390px are in `qa/`; full-page checks additionally captured 1024 and 320px. Product capture contexts: 1440×1000 and 390×844 CSS pixels, Chromium 158.0.8127.18, reduced motion for stable final-state images. These are CSS viewport emulations, not physical device claims.

Refinements from review: separated full-size image links from captions; kept historical/diagram provenance explicit; added a compact truthful QA table; preserved the current Mandate palette and reading hierarchy; used mobile stacking and full-size image access. No generic product mockups or invented quotes/results were added.

## Scoped files

- `src/pages/Process.tsx`
- `src/pages/process/process-journey.css`, `src/pages/process/capture-sizes.ts`
- `public/process/journey/` — actual captures, provenance manifest, public verification notes
- `scripts/capture-process-journey.mjs`
- `tests/e2e/current/process-journey.spec.ts`
- `tests/e2e/production.spec.ts` — lazy asset verification only
- `docs/process-journey/` — source, audit/reference lock, manifests, logs and visual QA
- Authorized scroll fix: `src/pages/homepage/use-homepage-smooth-scroll.ts`, `tests/e2e/current/homepage-smooth-scroll.spec.ts`
