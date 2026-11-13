# HOME-08 — Homepage completion

The homepage now follows the approved seven-section sequence: Hero, Leadership challenges, Product value, Our approach, Technology and judgment, Interactive demo, Final CTA. The remaining legacy questions section and scenario-oriented closing content were removed. Earlier completed sections, their interactions, and the live application are preserved.

The new closing invitation uses the supplied copy, a quiet dark surface following the light live-demo section, existing editorial typography, CTA yellow and an outlined secondary action. On mobile the actions stack full width. No new palette, assets, dependencies or application features were introduced. Header and footer consistently link to Leadership challenges, Our approach and Mandate Studio; Request a conversation opens the existing contact dialog. Explore Mandate Studio scrolls to the one existing live workspace, without resetting it or bypassing the guided entry.

The footer uses Mandate company branding, concise section navigation, prototype/design notes, and fictional-data/no-delivery disclosure. There is no live contact endpoint. The existing locally validated form now says “Preview contact request” and “Contact preview only / No inquiry was sent or saved,” instead of suggesting a recorded inquiry. The completion conversation query entry remains intact. No message is transmitted or persisted.

## Validation

- `pnpm lint`: passed, including a final rerun after the test-locator correction.
- `pnpm build`: passed (TypeScript + production Vite build).
- `pnpm test:unit`: 70/70 passed.
- `pnpm test:e2e`: initially 55/59 passed. Three new closing-section cases reached their final close action but had an ambiguous test locator for the visible Close button versus the existing X control; the locator was corrected. No UI change was necessary.
- `pnpm exec playwright test tests/e2e/current/homepage-completion.spec.ts`: final 3/3 passed at 1440, 390 and 320px. Verifies seven sections, removal of obsolete content, valid footer/CTA anchors, no horizontal page overflow, enquiry validation/focus return, explicit no-delivery result and no POST/PUT/PATCH request. Automated A/AA scans of the final section/footer returned zero violations.
- All existing homepage, embedded demo and standalone workflow cases passed in the full run, including both desktop/mobile completion/reset, dirty editing, version history, keyboard/modal handling and website return.
- `pnpm test:preview`: production assets/deep links passed, 1/1.
- `git diff --check`: passed.

The one remaining full-suite failure is the pre-existing 1440px standalone app chart-card text enlargement/custom-spacing overflow, independently reproduced without HOME-07 integration in `../home-07/baseline-enlargement.json`. HOME-08 does not modify app chart sizes or suppress that test. This is not a new marketing-page regression and is outside the requested homepage-only scope. No claim of complete WCAG certification or all-suite green is made.

Rendered review: [desktop closing section](final-1440.png), [mobile](final-390.png), [narrow mobile](final-320.png). Dark/light section rhythm, CTA hierarchy, readable line lengths, footer wrapping and mobile stacking were inspected.

## Scoped commit

The commit records the final component/styles, Home integration/contact copy, the two navigation selector updates, new completion checks, updated strategy/plan status and this evidence. Home and marketing-hero tests are staged from HEAD with only HOME-08 changes; preceding hero/navbar/challenges work remains intact in the working tree and is not swept into this run. Other app, asset, dependency and generated-report changes remain unstaged. No deployment or backend configuration was performed.
