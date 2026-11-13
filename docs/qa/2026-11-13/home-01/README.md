# HOME-01 — Foundation, navigation and hero

Scope: homepage foundation, header and hero only. Lower sections, the single existing embedded workspace, GuidedDemo, application routes/state, enquiry validation and video playback are retained. Existing sections remain in their current order until their individual replacement runs; no empty or duplicate section previews are introduced.

## Brief and reference lock

Audience: prospective executive-search clients considering a consequential business change. Establish the leadership question, then offer a conversation or the real sample. The fictional prototype disclosure stays adjacent to the CTAs. No business proof or metrics are added.

Reference: https://www.concourse.ai/, inspected in the browser and via page text on 2026-11-13. The live header has compact horizontal navigation over dark translucent media, restrained buttons and a generous hero with large white typography. Borrow its cinematic contrast, measured spacing and quiet navigation. Preserve Mandate's centered composition, Inter, company logo, yellow CTA and supplied two-clip playlist. Reject competitor branding, announcement strip, customer proof and left-bottom positioning. The automated reference capture showed only the upper video strip loaded; the supplied reference screenshot also informs the full-bleed video direction. No claim is made that the competitor's complete video was visually inspected.

Desktop wireframe: full-width dark glass header → centered eyebrow → two headline phrases → constrained body → primary/secondary actions → sample disclosure. Background media fills the hero; Pause/Play remains independently reachable at bottom right. Mobile: logo/menu row, readable wrapped headline, narrower body, stacked full-width actions; menu opens below header. No app shell changes.

## Foundations and section handoff

`src/pages/homepage/homepage.css` defines landing-scoped container, gutter, section rhythm and heading/copy utilities for the upcoming section replacements. It does not restyle all existing lower sections or shared product tokens. Future order remains: hero; leadership challenges; living mandate; candidate evaluation; discussion brief; how an assignment works; interactive dashboard; final CTA. Move the current embed only in its approved integration run, preserving its ref/lifecycle.

Our approach targets existing `#our-process`; Leadership challenges targets `#challenges`; header/hero sample links target `#sample-workspace`, the actual existing iframe section. Request a conversation retains the local demo enquiry. Production contact delivery remains unconfigured. Prior documented guide navigation/dirty-state/iframe-return issues remain outside this run.

## Repository boundary

At the start of this run, Home.tsx and the existing hero test were untracked, alongside most of the existing application. The scoped commit adds those two homepage files with their preserved existing content, the new scoped CSS and this report. It does not stage the broader application, tracked pre-existing modifications, assets, dependencies, previous reports or unrelated untracked files. This is an incremental commit against the supplied working tree; HEAD alone does not yet represent the full current app.

## Validation

Passed on 2026-11-13:

- `pnpm lint`.
- `pnpm build` (includes TypeScript compilation).
- `pnpm exec playwright test tests/e2e/current/marketing-hero.spec.ts tests/e2e/current/workflow.spec.ts` — 12 passed. Covers hero at 1440/390/320, muted sequential clips/pause, reduced motion, enquiry, desktop/mobile anchor navigation and retained iframe identity; existing assignment editing, profiles, sources, completion, reset and narrow reflow/keyboard checks.
- `pnpm test:preview` — production asset/deep-link smoke passed.
- Hero/header automated WCAG A/AA checks returned zero violations at all three hero sizes. Existing workflow checks also passed. This is automated coverage, not a full manual WCAG certification.

Rendered desktop and 390/320 screenshots reviewed: centered hierarchy, two-line desktop headline, stacked mobile CTAs, legible disclosure, no horizontal overflow. Screenshots: [desktop](hero-1440.png), [mobile](hero-390.png), [narrow mobile](hero-320.png). Reduced motion removes entrance animation and defaults to the static poster; explicit playback remains available.

A comparison with the preceding audit's 818-file hash manifest found only Home.tsx, the focused hero test and generated Playwright report changed among pre-existing files. All lower Home sections are unchanged apart from the sample section's anchor id. No full-suite/unit rerun was needed for this presentation-only change; the targeted workflow and production suites are the regression evidence.

Remaining gaps: a real contact endpoint is still absent; previously documented guided-demo stage/return/dirty-state issues remain reserved for section 07. Most of the supplied app still exists as unrelated untracked work and is intentionally excluded from this scoped commit.
