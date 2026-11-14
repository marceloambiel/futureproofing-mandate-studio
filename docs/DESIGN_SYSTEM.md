# Mandate Studio interface rules

The current app and its approved desktop/mobile differences are the reference. Preserve the assignment workflow, candidate content, document editing and demo behavior.

## Shared foundations

`src/theme.css` owns the semantic palette. The shell is white; the page is #F9F9F8. The homepage alone uses a soft yellow glow at the bottom center. Selected navigation uses #F5F5F4, with dark text/icons.

- Primary CTA: #F9DB74 with #292C29 text. Tertiary actions change text to the darker mustard action token on hover, without an underline or added fill.
- Raised cards/documents use white. Chart cards use 80% white, 10px background blur, and a white border. Notifications share the 80% white glass surface and grayscale text hierarchy; the assignment toast has a yellow border countdown.
- Focus panels: #2E322E with #F7F8F4 text and #C5C9BF secondary text. Current Assignments and the assignment information column are dark. Brief Breakdown is white on desktop, transparent on mobile.
- Charts use pale fills with stronger mustard, sage, apricot, rose and lilac strokes. Pending gray uses #7A8276 to meet 3:1 against its pale fill. No CTA-yellow text on white backgrounds.
- NEW is solid orange #D64000 with white mono uppercase text. Other status tags retain semantic labels as well as color. The AI-generated brief pill uses the Consumer chart’s lilac fill and stroke.
- Normal text must meet 4.5:1 contrast; large text and meaningful graphical/control boundaries 3:1. Disabled/decorative elements have the applicable WCAG exceptions. Automated color reports require manual review for glass, gradients and overlapping previews.

Inter regular is the default. Page/task titles are 20px, homepage greeting 24px, card titles/candidate names 16px, body/menu 14px, supporting labels 12px. Comparison criteria use medium weight. Mono 10px uppercase is reserved for status tags. Documents retain ordinary document typography and section hierarchy.

Cards/panels/table outer corners use `--card-radius:16px`. Small controls/tags/portraits use 4px. True pills and circles retain their special geometry; mobile full-screen overlays use square screen edges. Content must wrap under larger text and custom spacing rather than overflow. Requested one-line summaries may truncate with their complete accessible text retained.

## Desktop rules (801px and above)

- White sidebar and navbar; navbar outer controls align with the page edges. Page gutters adapt to width, reaching 128px on full desktop.
- Assignment context is a dark left column on every step. The right workspace preserves its approved page layouts. Progression retains all three milestones with 48px lateral inset.
- Assignment actions float at the lower right, aligned to the progression component. Placement value and Candidates by sector retain their fixed 280px desktop height; the other chart surfaces can grow for enlarged text; the assignment list spans both rows.
- Candidate cards retain white containers and 8px additional space above/below the location/education row.
- Comparison rows are white; all header cells are dark, including the empty first cell. The first-column labels use medium weight and 8px left inset. Cell order is status, evidence, Source; source actions stay gray.
- Available assignments use a 5% white hover fill, without a stroke. Blocked assignments retain no interactive hover. After submission, remove Northline from the current list and show a separate non-actionable Sent for review summary; keep that state after reload. Reset Demo restores the active assignment. Submitted status only applies while the brief matches the reviewed assignment details.

## Mobile rules (800px and below)

- Hide the desktop rail, breadcrumbs and history arrows. Use hamburger navigation, the centered monochrome logo and the notification action. The homepage navbar shares the continuous page gradient.
- The assignment navbar, summary and current-step navigation form one dark block. Preserve summary open/closed state while switching steps. Show a divider only while it is open.
- The progression control shows the current step centered, with previous/next chevrons. Only unlocked steps can be visited. Native horizontal page scrolling and header swipes show adjacent page content. Inactive pages are inert. Chevrons provide a non-drag alternative; reduced-motion navigation is immediate.
- Repeated page titles are visually removed; subtitles remain. The current step is a heading. Brief Breakdown and candidates live on the page background, with section/item dividers instead of surrounding cards.
- Client brief and discussion brief use tall previews opening full-screen reading/editing views. Preview text heights are 300px and 412.5px respectively. Keep a further 24px gap below the client brief.
- Main workflow actions float at the viewport bottom with 24px lateral inset. Editor Save Changes uses the same inset. Neither has a footer card, fill or divider. Reserve scroll room and focus clearance so text/controls remain reachable beneath them.
- The discussion editor has a dark title-left/Cancel-right header. Formatting is one row with grouped text/list controls and icon-only history; it can scroll if user text enlargement needs more room. The toolbar follows the measured header height. Save closes the editor only on success; Cancel protects dirty content.
- Homepage chart cards retain the approved portrait carousel, shortened by 20%. The centered Overview title precedes it. Dot glyphs remain 6×6px (active 24×6px), radius 300px, with a gentle state animation. Hit areas are now at least 24×44px with non-overlapping targets; visual gaps are 18px to accommodate the minimum touch area.
- Hide scrollbar chrome without disabling native scrolling or reserving a gutter. Maintain full screen width and the approved content padding. Chart surfaces can grow when enlarged text would otherwise clip.
- Prefer 44×44px standalone touch controls. The AA minimum is 24×24px, with relevant spacing/inline exceptions; compact chart dots use that minimum. Small inline history icons meet 24px and remain separated from other controls. Comparison/source and profile contact actions have 44px height.
- Mobile entry fields/selects use at least 16px text to avoid small-field focus zoom. Respect safe-area insets and reduced motion.

## Verification and limits

Use `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm build`, `pnpm test:e2e`, and `pnpm test:preview`. Current browser contracts live in `tests/e2e/current` and the production smoke test. Historical prototype tests can be run with `playwright.legacy.config.ts`; they describe earlier UI architecture.

Audit evidence: `docs/qa/2026-11-12/final-design-system/`. Preserve desktop and mobile differences when reviewing the shared foundations. Automated axe checks and emulated-browser tests are evidence, not WCAG certification; physical-device and screen-reader validation remain separate.
