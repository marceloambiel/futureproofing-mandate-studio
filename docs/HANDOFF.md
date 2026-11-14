# Mandate Studio — developer handoff

This repository contains a finished frontend prototype for the FutureProofing challenge: a marketing website, a project hub, a design-process document and a connected consultant workspace. All client/candidate records are fictional. Document generation, versioning, notifications and review submission are local simulations.

## Run it

Use Node 24.22.2 and pnpm 12.16.1, pinned in `.node-version` and `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1
```

The development URL is `http://127.0.0.1:5173`. `pnpm build` creates `dist/`; `pnpm preview --host 127.0.0.1 --port 4173` serves that exact production build. Test production output as well as development mode: the two have different CSS bundling/minification paths.

## Code map

| Responsibility | Start here |
| --- | --- |
| Browser boot, global styles | `src/main.tsx`, `src/index.css`, `src/theme.css` |
| Routes, shared providers, iframe history | `src/App.tsx` |
| Marketing website | `src/pages/Home.tsx`, `src/pages/homepage/` |
| Project hub, presentation gate, Loom modal | `src/features/PrototypeNotes.tsx`, `prototype-hub.css` |
| Design-process article | `src/pages/Process.tsx`, `src/pages/process/` |
| Application shell and fresh demo entry | `src/app/Shell.tsx`, `WorkspaceEntry.tsx` |
| Consultant screens | `src/features/Assignment.tsx`, `Candidates.tsx`, `Discussion.tsx`, `AssignmentComplete.tsx` |
| Candidate/profile/document components | `src/components/workspace/` |
| Fictional records and pure business rules | `src/domain/` |
| Document session and validated persistence | `src/state/session.ts`, `persistence.ts`, `WorkspaceProvider.tsx` |
| Comparison, notification and assignment preferences | `src/state/WorkspaceV2Provider.tsx` |
| Available steps and timed local preparation | `src/state/AssignmentFlowProvider.tsx`, `src/domain/assignment-flow.ts` |
| Shared accessible controls | `src/components/ui/` |
| Unit contracts and current browser checks | `tests/unit/`, `tests/e2e/current/`, `tests/e2e/production.spec.ts` |

`src/lib/utils.ts` is retained because `components.json` registers it as the shadcn utility alias, even though the current app imports `cn` directly. Historical browser specs are opt-in through `playwright.legacy.config.ts`; historical diagnostics are labeled in `scripts/archive/`.

## Routes and entry behavior

- `/`: marketing website; its section links stay on the page.
- `/prototype-notes`: project hub. Its password is a presentation-only frontend gate stored for the tab session. It does not protect the public source, assets or direct app routes.
- `/process`: public nine-chapter design-process article.
- `/workspace` and `/workspace/home`: application dashboard.
- `/workspace/assignment`: current client brief and structured requirements.
- `/workspace/candidates`: selection, profiles and comparison.
- `/workspace/experts`: the same three fictional profiles with local filters.
- `/workspace/discussion`: discussion document, editor, versions and review action.
- `/workspace/completed`: local completion state and restart/return actions.

Website and hub demo entry use `/workspace?restart=1`. `WorkspaceEntry` resets both sample stores, consumes the query flag and replaces that history entry before mounting the shell. Ordinary in-app navigation and reloads preserve progress. The inert homepage preview uses `/workspace?preview=1` and never requests a reset. Its iframe uses a memory router so it does not consume the website's history. The real demo opens as a full-page application.

## State and document rules

1. `src/domain/model.ts` supplies the immutable candidate facts and document snapshots. V1 is the earlier approved expansion excerpt; V2 starts as an integration draft. These version IDs are separate from the product's v2 label and preference schema name.
2. `WorkspaceSession` owns a saved workspace plus an optional working copy. Save, restore, conflict handling and review readiness go through this session; components should not write document storage directly.
3. Saving changed content appends a draft. A no-op save does not fabricate a new version. Restoring historical content creates a new draft; it cannot inherit historical approval.
4. Assignment-detail revisions can require fresh review. An outdated expansion opening is blocked from being sent for review until aligned with the current integration mandate.
5. Comparison membership and notification/step choices belong to the preference store. Removing a candidate changes the working selection, not the immutable evidence or a hiring outcome.
6. `useAssignmentSubmitted` derives completion from the reviewed snapshot and assignment-detail revision. It determines whether the dashboard shows an active task or a sent summary.
7. Draft HTML is sanitized by `src/domain/discussion-document.ts`. Preserve the allowlist and document formatting/round-trip tests when changing the editor.

Storage keys are `mandate-studio:v1` for document state and `mandate-studio:v2:preferences` for comparison/assignment preferences. The separate `mandate-studio:hub-access` session key controls only the hub presentation gate. Reset clears only the two sample workspace stores. Storage denial, corruption and cross-tab conflicts have explicit UI states; do not silently replace those safeguards.

## Styling and motion

- `src/theme.css` owns semantic colors and shared tokens. Marketing styles are scoped under `.mandate-home`; process styles under `.process-journey`; hub styles under `.prototype-hub`.
- Page/component CSS is colocated with its owner. Preserve declaration, rule and media-query order. Later refinements deliberately override earlier rules; a cascade consolidation needs its own visual regression pass.
- Profile drawers and mobile document overlays explicitly use `translate: none !important`. This prevents production CSS minification from dropping the reset while shared centered-dialog translation utilities remain active. Removing it recreates an off-screen overlay bug.
- Keep desktop and mobile interaction rules distinct. Mobile documents use full-screen overlays, persistent save/actions and current-step navigation; desktop retains adjacent context and documents.
- Homepage Lenis scrolling is isolated to marketing. The workspace and process article use their own native scrolling. Horizontal comparison gestures must remain native.
- Existing animation hooks clean up listeners, observers, timers and animation frames. Keep reduced-motion fallbacks and cancellation behavior when editing motion.

Formatting uses Prettier with the repository's two-space/no-semicolon style. Automatic Tailwind class sorting is intentionally disabled so formatting does not reorder authored class lists. `pnpm format` is scoped to maintained source, tests, scripts and root configuration; generated reports and local archives are excluded.

## Verification

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
pnpm test:e2e
pnpm test:preview
```

`pnpm check` runs the existing aggregate checks. Current browser tests run on Chromium at desktop and mobile sizes and include keyboard/axe checks; they are not a claim of full WCAG certification or physical-device/user research. Keep the browser suites sequential because they share artifact folders. Current output goes to ignored `docs/run/` paths.

For focused release regression, run the workflow, demo-entry, hub-access, process and production specs. Verify both current and historical document states, the three candidates and uncertainty labels, save/version identity, review confirmation/completion, browser refreshes, website return and demo restart. Include the production profile drawer and mobile editor positioning.

The cleanup began at commit `92399e6f4be69e3c546c372df907f4eee2128a7a`. The JavaScript equivalence audit compares emitted syntax trees while normalizing harmless parentheses, object-key quoting and adjacent JSX text. The CSS audit compares canonical compiled rules/values in order, normalizing insignificant comma whitespace. Generated audit evidence stays local under `docs/run/handoff/`; do not interpret a different asset filename alone as a behavior change.

## Cleanup review — 14 November 2026

This handoff preserves the existing interface and workflow. Maintained source and tests were formatted, six unused components and two scaffold assets removed, three obsolete diagnostic scripts archived, and the unused Tailwind formatter plugin removed. Runtime dependency versions remain unchanged. Formatting checks now have a dedicated command.

Verification against the pre-cleanup production build (`92399e6`):

- Emitted JavaScript equivalence: 123 modules, no semantic differences after the documented normalization.
- Compiled CSS equivalence: 34 stylesheets, no rule/value/order differences after whitespace normalization.
- Formatting, lint, type checking and production build passed; all 71 unit tests passed.
- Eight focused production workflow/routing checks passed.
- Full Chromium suite: both the preserved baseline and cleaned production build passed 84 of 100 checks, with the same 16 failures and no newly failing tests. Assertions were not rewritten to conceal existing failures.

The existing failures cover enlarged homepage content, approach/timeline expectations, stack focus behavior, animation timing, obsolete navigation/CTA expectations, mobile technology cards and glass-navbar theme expectations. They remain follow-up work requiring a separate UI/test-contract review; this cleanup does not claim that the full aggregate check is green. Local comparison logs and results are retained in ignored `docs/run/handoff/`.

No runtime speed improvement was measured. The optimization here is maintainability and removal of unused material, with behavior preservation checked against the original build.

## Deployment

Public source: https://github.com/marceloambiel/futureproofing-mandate-studio

Cloudflare Pages project: `futureproofing-mandate-studio`. Source is GitHub `main`; command `pnpm build`; output `dist`; root is the repository root. Production is https://futureproofing.marceloambiel.com and the process article is `/process`. Native Pages SPA fallback handles direct routes and refreshes; there is no top-level `404.html` or catch-all redirect rule.

The initial release used Pages Git builds triggered through its API. Automatic push triggering was not confirmed during that release; inspect GitHub's Cloudflare Pages app repository permissions and Pages source settings before relying on it. Do not replace this project with a Direct Upload project.

The source publication audit is in `docs/deployment/publication-audit.md`. Existing historical QA reports retain their original dates and limitations. Local checkpoints, private reference evidence, generated reports, dependencies and builds are intentionally ignored and were preserved on disk.
