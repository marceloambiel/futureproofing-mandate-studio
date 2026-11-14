# MANDATE-PROCESS-001 — editorial and implementation audit

Prepared 2026-11-14. Source: `source.md`, copied verbatim from the supplied November 14 draft. Starting HEAD: `dd6a662dce28d51d7d1931d2e294a3f8b506cabc`. The starting worktree has substantial modified and untracked code, including Process.tsx; no clean checkout, reset or broad commit is appropriate. This run changes only the process page, its scoped styles, captures, capture script, tests and these notes. No publishing/submission.

## Brief / reference lock / structure

Audience: FutureProofing reviewers. Job: understand the design reasoning and distinguish implementation evidence from proposed validation. Main actions: website and existing workspace; no reset or new demo logic. Preserve Mandate company/product marks, local Inter, yellow CTA #F9DB74, paper #F9F9F8, white surfaces, neutral dark editorial sections, concise evidence labels. `/process` already exists and is lazy routed in App.tsx; reuse it.

Visual direction: a readable editorial case study with genuine interface artifacts and a prominent architecture-change diagram. Dominant reference is the current Mandate site and app. Secondary structural research: Mobbin Contractbook case study section (`https://mobbin.com/sites/sections/1a6a03f0-a2fc-4b97-9efe-c53dc42899db`, inspected November 14): adjacent contents navigation and large artifact + short explanation. Notion (`https://mobbin.com/sites/sections/da729253-e834-47d1-b460-2397ebcd9c08`): legible product screenshots paired with concise captions. Borrow reading anatomy only, not colors, customer claims or logos. Concourse.ai is acknowledged as the designer's historical homepage composition reference; no claim of partnership or original research. No external reference imagery is packaged.

Desktop wireframe: compact persistent company header → editorial hero with actual website/workspace composition → chapter contents → eight large chapters with alternating light/dark backgrounds, short decision copy and large screenshots/diagrams → final actions → expandable source/QA appendix. Mobile: header wraps navigation clearly; linear reading order, contents wraps (no hidden chapters), all pairs stack, screenshots preserve full aspect ratio with a full-size image link. Screenshot labels are not controls. No autoplay narrative, carousel, required hover, or copied app providers. Motion remains limited to native disclosure/hover and respects reduced motion. Process uses native scroll; homepage Lenis does not mount here.

Narrative map:
1. What is the challenge? Revised mandate + honest scope → why evidence matters.
2. Why no winner? Three immutable candidate facts and limitations → questions to investigate.
3. How does the work connect? Six-stage actual flow + app captures → information order.
4. Which interactions matter? Brief/editing, profile/comparison, editable discussion/history → inspectable reasoning.
5. What changed in marketing? Historical hero + architecture before/after → broader client value before one demo.
6. Which trade-offs won? No score, historical approval guard, independent app → deliberate scope.
7. What has been checked? Paired responsive captures and actual automated QA, separately labeled proposed consultant study.
8. What was delivered / remains? Prototype boundaries + one proposed comprehension metric → existing website/demo routes.

## Corrections to the supplied narrative

- Current demo is **self-directed**. WorkspaceDemo now animates the homepage preview and navigates to `/workspace`. GuidedDemo and guided-workspace.css are deleted in the starting dirty worktree. Do not claim an active guided slideshow or same iframe instance expanded interactively. Browser local state bridges entry/return.
- Git confirms homepage implementation commits on Nov 13: 524e818 foundation/hero; f7ced5f product value; 3756b06 approach; 68e71bc technology; 25f07f1 historical guided demo; dd6a662 homepage completion. These prove specific snapshots, not execution of every numbered prompt. Strategy docs and subsequent uncommitted code are newer/different evidence layers.
- Archived `524e818:src/pages/Home.tsx` places the sample workspace immediately after the hero and includes fictional facts in later marketing sections. Current Home.tsx puts service challenges/value/approach/capabilities ahead of one demo, then FAQ/contact. This supports the central strategic correction. The archived screenshot is extracted from that exact commit, not reconstructed. It shows the hero, not the complete early page; the complete architecture comparison is explicitly a diagram based on code.
- Current client source documents and discussion versions are distinct. `model.ts` preserves V1 `earlier-approved`, starts V2 `draft`, appends draft snapshots for edits/restores, and blocks an outdated expansion opening from review. `WorkspaceV2Provider.tsx` increments assignment detail revision and requires fresh review on editing/restoring; candidate generation clears that requirement only after explicit confirmation. UI version labels do not establish server-side approval.
- Candidate source facts: A Claire Bennett 30 days / scale 4→12 / integration not established; B Marcus Reed 45 days / two integrations / 12-site scale unknown; C Daniel Foster 90 days / integration unverified / scale not supplied. Profile employers, photos and extended history are synthetic demo context, not original evidence or independent verification.
- Search and drafting are timed local simulations (`assignment-flow.ts`, 2400/2600ms); `buildDiscussionDocument` composes deterministic local data, not live AI. Browser storage, edits, draft history and review flags are local. Review UI says manager review; board review is the challenge purpose, not a real transmission.
- Completed state removes the assignment from the active list and shows waiting-for-review. Completion conversion, restart and submitted-assignment view use existing behavior.
- Previous Process.tsx contains stale guided-demo, indigo, backend and historical test narrative; replace those claims only on `/process`. Existing homepage strategy documents retain historical descriptions; do not silently rewrite them in this run.
- Source walkthrough and personal device-finalization statements are **reported**, not independent consultant research. Proposed comprehension study and 4-of-5 target remain proposed. No commercial outcomes, interviews or measured time gains are claimed.

## Evidence provenance

See capture manifest and QA report generated in this folder. Fresh contexts use only synthetic local data and do not alter the user's browser state. Screenshots are real Chromium captures of the current working tree, not HEAD-only artifacts. Archived hero: commit 524e818, committed Nov 13. Exact screenshot date is not inferred beyond that commit provenance. Existing QA reports elsewhere are historical evidence and are not represented as this run's results.

## Authorized steering during verification

The user reported that website scrolling stuck in the second section and explicitly asked for a fix. A real-wheel regression reproduced the stall: after moving from text into the comparison during active momentum, a 400px wheel input advanced only 48px. The comparison was excluded from Lenis for all wheel directions, allowing native vertical scrolling to fight Lenis. `use-homepage-smooth-scroll.ts` now keeps vertical gestures in Lenis while preserving native horizontal gestures. No visual redesign or application state changed. The new regression and existing Lenis/stack tests pass (7/7); the failing receipt is retained as `scroll-stall-red.log`. This user-authorized functional correction is the only homepage source change in this run.

## Rendered critique and refinements

Actual desktop/mobile hero, strategic-change chapter and candidate evidence reviewed visually. The preserved Mandate palette/type and real artifacts remain the dominant visual language. Captions now put the full-size image link on a separate line. The before/after diagram distinguishes source interpretation from genuine historical screenshots. Three candidate evidence panels are the one deliberate repeated card pattern, because the records require parallel comparison; the other chapters use different editorial compositions. Added a small factual QA matrix instead of fabricated success metrics. Process screenshots reserve intrinsic image dimensions and lazy-load below the fold. The production smoke harness was updated to request lazy screenshot assets eagerly during the asset check, rather than removing lazy loading from production.
