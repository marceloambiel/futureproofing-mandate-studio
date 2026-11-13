# HOME-06 — Technology and judgment

Scope: implement section 05 after Our approach. Replace the obsolete legacy evidence/trust blocks (and their scenario-specific candidate facts/stale “never sent” wording), as specified by the current plan. Other homepage sections and the live app/editor are unchanged.

## Design lock

Continue the Concourse-inspired modular product direction established in HOME-04: an editorial dark introduction and substantial light interface surfaces with asymmetric proportions. Existing Mandate tokens, Inter, 16px cards, semantic tags and product excerpts remain authoritative. No new palette, stock imagery, generic decorative icons or third-party dependencies.

Desktop: context/navigation and revisions cards sit in the narrower left column; the dominant AI-assisted document occupies the wider top-right card, with human review below it. The document sizes naturally to its content. At <=1100px, the document leads a single-column stack, followed by context, revisions and human review. Nothing is scaled down as an image or clipped behind nested scrolling.

Cards subtly change border on hover. A one-time 240ms/6px entrance triggers when the section enters the viewport; content is visible even before observer activation. Reduced motion removes the animation/transition. The existing sticky navbar recognizes the section's explicit dark theme.

## Reuse and capability limits

- Everything in context: read-only adaptation of the app's white shell navigation, three workflow labels and assignment overview, using actual product branding but no client/candidate case facts.
- AI-assisted preparation: reuses DiscussionShowcase from HOME-04/05 as the dominant visual. It remains an anonymized, read-only document illustration with human review required; it does not invoke generation.
- Room to refine: reuses the actual existing toolbar presentation, now exported as DiscussionToolbarPreview without changing its markup. Two illustrative local draft selectors reveal earlier/current context; they do not restore/save real versions.
- Human judgment: reuses Button and the actual confirmation Dialog primitives/styling. Preview review step opens the same review/locked-version confirmation concept. Send for review is disabled and the modal explicitly says no document will be sent. Cancel/Escape and focus return work. No app submission routine is called.

The actual editor and domain functions are untouched. No autonomous candidate selection, live AI integration, backend delivery, real saved record or commercial result is claimed. Adjacent disclosure explicitly identifies simulated generation/submission in the sample. No providers, persistence keys, candidate logic or additional iframes are introduced.

## Commit scope

TechnologyJudgment.tsx, technology-judgment.css, homepage-technology.spec.ts, this report/captures, the shared toolbar export in ProductValue.tsx and the section replacement/import cleanup in Home.tsx. Prior sticky-nav/hero changes remain in the working tree, excluded via scoped index versions of Home/ProductValue. No broad staging or unrelated checkpoint.

## Validation

Passed:

- `pnpm lint` and `pnpm build` (TypeScript + Vite), including the final compact layout.
- Five new technology checks: 1440/1024/390/320 layouts, dominant document sizing, safe preview confirmation, disabled submission, focus return, keyboard draft selection, absence of scenario facts, one existing iframe, no overflow/clipped interfaces, dark navbar theme, and reduced motion.
- 24 existing regression checks passed: five Our approach, four Product value, eight hero/navbar and seven desktop/mobile assignment workflow/profile/editor/review checks. The actual editor's save/review/completion/restart behavior remains intact.
- `pnpm test:preview` — final production asset/deep-link smoke passed.

Section and review-modal automated WCAG A/AA scans returned zero violations at all four sizes. Screenshot review covered the asymmetric desktop composition, document-led mobile stack and the shared confirmation dialog. [Desktop](technology-1440.png), [tablet](technology-1024.png), [mobile](technology-390.png), [narrow mobile](technology-320.png), [mobile review preview](review-preview-390.png).

The animation wait tolerates normal cancelled hover transitions during scroll; no accessibility rule is excluded. Fixed website navigation and the offscreen skip link are hidden only in full-section element captures to avoid screenshot artifacts. Their actual behavior/contrast is covered by existing navbar tests.

No section-specific blocker. Illustrations are read-only; generation and submission remain simulated in the sample. Previously documented guide integration issues and lack of production contact delivery are outside this scope. No working app/editor source or domain logic was changed.
