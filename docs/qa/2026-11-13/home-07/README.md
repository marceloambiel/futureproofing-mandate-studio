# HOME-07 — Interactive demo

## Scope and design

Section 06 replaces/moves the old early working-preview to follow Technology and judgment. It uses the exact supplied headline, description, CTA and secondary text. The single existing live dashboard is retained, with an immersive light-neutral frame, responsive expansion control and adjacent fictional-data disclosure. Desktop preview width can extend beyond the editorial text column (up to 1440px, with 48px minimum side spacing) so the real dashboard is readable. Mobile uses the page's existing content gutters.

The Concourse-inspired product-stage direction follows the reference lock established in HOME-04; no competitor assets or new application are introduced. No other homepage sections, app screens, domain fixtures or routes are rebuilt. The remaining legacy questions/final CTA await their own run.

## Persistent expansion and guidance

GuidedDemo now owns one stable iframe at the existing `/workspace?preview=1` source. Opening/closing uses CSS full-viewport presentation in the same DOM location; no portal move, key change, src change, second iframe or app remount occurs. This is full viewport expansion, not an OS/browser Fullscreen API request. The primary CTA enters the assignment through the existing router; the dashboard's actual assignment/notification link also expands after the click. Expand workspace resumes the current screen. Scrolling/hovering never enters the guide.

Guidance follows the child's actual current route. Back/Next use the child's existing router; Next stays disabled until the actual AssignmentFlowProvider makes that destination available. The real in-app match/prepare actions still own generation and review. No unlocking, simulated progress, candidate evaluation or submission logic is copied into the host.

The expanded surface has dialog semantics, labelled guidance, background inertness, parent scroll lock, keyboard traversal across the iframe boundary, and focus/scroll return. Child profile/history/reset dialogs and notification popovers consume Escape before the guide. Closing the guide or using Website collapses it while retaining the current app route, open editor, unsaved buffer and local UI state. Completion's contact CTA returns to the host enquiry rather than loading a second homepage inside the iframe. Existing completion/restart/reset routines remain authoritative.

## Minimal app bridge

- `src/domain/embedded-workspace.ts`: typed same-origin host/frame channel and explicit preview-context gate.
- `src/hooks/use-embedded-workspace.ts`: mounted through one hook call in Shell; reports real route/dirty state, delegates navigation/discard to existing router/session, redirects website-return intent to the host, and coordinates keyboard boundaries only while expanded.
- AssignmentFlowProvider publishes only its existing availability flags (and responds to a status request); its stage rules, timers and generation functions are unchanged.

Both directions validate origin and source window. Navigation is restricted to existing workspace routes and is still subject to the app's real route/dirty guards. The bridge is inactive in standalone app use and cross-origin embeds. Open child dialogs/popovers are reported as presentation state so host navigation cannot bypass them. Parent page departure uses the actual reported dirty state and explicit Keep editing / Discard and leave choices; browser reload/close retains native beforeunload protection. No storage record, new route, network service or data model is added.

This resolves the previously documented keyed-frame loss, mismatched guide stages, obsolete dirty-marker queries and iframe-only Website return. Collapsing needs no discard prompt because it does not destroy or navigate the app.

## Repository/commit boundary

Home.tsx is staged with only section relocation/integration and obsolete embed-ref/import removal, excluding prior hero/navbar refinements. GuidedDemo is an existing untracked component being refactored, not a new application. Shell.tsx and AssignmentFlowProvider.tsx were also untracked baseline files: this scoped commit records those necessary integration files with their existing source preserved and only the bridge hook/publisher added. The existing untracked editor unit-test file is recorded with only the stale selector correction noted below. No unrelated application files, global tokens, dependencies or broader worktree checkpoint is staged.

## Validation

Results:

- `pnpm lint` and `pnpm build` passed.
- `pnpm test:unit`: 70/70 passed. A pre-existing stale editor-test selector was aligned from “View submitted brief” to the existing “View submitted assignment” label; no editor/completion UI changed.
- `pnpm test:e2e`: 55/56 passed. All new demo cases passed; the remaining failure is the existing standalone 1440px text-enlargement/custom-spacing chart-card case. It is not excluded or marked passed.
- After the final open-dialog navigation safeguard, `homepage-demo.spec.ts` plus `workflow.spec.ts`: 12/12 passed. Includes both desktop/mobile embedded completion, reset, original/current client brief history, discussion history, saved/unsaved editing, same iframe element/document through expansion, correct guide/route alignment, guarded host departure, message-source validation, modal/popover Escape, viewport sizing, keyboard traversal and focus/scroll restoration. Host Back/Next cannot navigate behind an open app dialog.
- `pnpm test:preview`: production assets/deep links passed.
- Expanded desktop/mobile automated A/AA scans returned zero violations. No iframe/editor state is rebuilt or cleared on close.

The full-suite failure was independently reproduced in an isolated temporary source copy using the pre-HOME-07 Shell and AssignmentFlowProvider files, without modifying the working repository. With doubled text and custom spacing, Placement value and Candidates by sector remain 278px high while contents need 591px/826px. See baseline-enlargement.json. This pre-existing app layout issue is outside the section-only task; chart CSS and the accessibility test remain unchanged.

Rendered review: [desktop section](demo-1440.png), [mobile section](demo-390.png), [expanded desktop](expanded-1440.png), [expanded mobile](expanded-390.png). Element captures hide the unrelated fixed website navbar/skip link only; the full-viewport captures show actual guide/app UI. The preview is the live application, including clearly disclosed fictional dashboard metrics.

No demo-flow blocker remains. Residual limits: native beforeunload protects reload/close, the contact form remains a local prototype, and the unrelated desktop chart enlargement issue remains open. No new backend or real submission is claimed.
