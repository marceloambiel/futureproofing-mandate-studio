# Mandate homepage strategy — HOME-08 completion

## HOME-08 current implementation (supersedes historical status below)

All seven sections are implemented in the approved order: Hero → Leadership challenges → Product value → Our approach → Technology and judgment → Interactive demo → Final CTA. The HOME-03 strategy below remains authoritative; its “later run” and unresolved-guide statements describe the historical starting point, not current implementation status.

- Hero retains the subsequently approved shorter body: “Executive-search advice for growing organizations. Supported by a connected workspace that keeps priorities in focus.” Navigation now consistently uses Leadership challenges / Our approach / Mandate Studio / Request a conversation.
- ProductValue, OurApproach and TechnologyJudgment reuse read-only interface excerpts, without independent business state. InteractiveDemo and GuidedDemo own the single persistent workspace iframe; HOME-07 resolved same-instance expansion, real step availability, dirty buffers, nested overlays, focus restoration and return to website. See `docs/qa/2026-11-13/home-07/README.md` for functional evidence and remaining limitations.
- HOME-08 replaces the remaining obsolete questions/closing content with `src/pages/homepage/FinalConversation.tsx` and scoped `final-conversation.css`. Final copy: “Let's find the leadership your next chapter needs.” Actions: Request a conversation (existing local preview dialog) and Explore Mandate Studio (`#sample-workspace`, never a locked deep link).
- Footer uses the company Mandate logo, the same section anchors and contact action, plus prototype notes/design process and explicit fictional-data/no-delivery disclosure.
- No live contact destination exists. The dialog validates sample information locally, labels its action “Preview contact request”, and confirms “No inquiry was sent or saved.” No endpoint, submission, delivery or storage is invented. The completion `/?conversation=1` entry remains supported.
- No application routes, workflow, data, editor or reset behavior are changed in HOME-08. Existing unrelated worktree changes remain outside this run.



## Supersession and scope

**This contract explicitly supersedes HOME-00's eight-section content contract and its scenario-led showcase requirements.** The former Living Mandate / Candidate Evaluation / Discussion Brief sequence is no longer the page architecture. HOME-00's repository findings remain useful technical evidence, not current editorial instructions. Historical originals are preserved in `docs/archive/mandate-homepage-brief-home-00.md` and `docs/archive/mandate-homepage-plan-home-00.md`.

HOME-00–02 remain completed work. Preserve their reusable foundations, components, styling and working behavior. HOME-03 changes strategy and the copy/illustrations of the existing hero and Leadership challenges only; it does not implement sections 03–07, restructure the application or move/rebuild the embedded demo. Existing later legacy sections remain temporarily pending replacement. Their scenario copy and the embed's early placement are transition debt, not the approved final strategy.

## Positioning, audience and purpose

**Mandate is a modern executive-search advisory experience supported by a connected digital workspace.** The company helps organizations clarify the leadership they need as they grow, transform or navigate a critical transition. The homepage sells that broader experience; it does not narrate a prototype exercise.

Audience: organizational decision-makers with a consequential leadership need. They should understand the situations Mandate helps navigate, the value of an evolving brief and transparent evaluation, the role of advisory judgment, and their next action. Primary conversion: **Request a conversation**. Secondary exploration: **Explore sample workspace**.

Mandate: clarity through change. Mandate is the company; Mandate Studio is its workspace/product. Use `public/brand/mandate.svg` on the website and the existing Mandate Studio branding inside the application. Preserve the near-black icon gradient with its small CTA-yellow tip and existing monochrome variants.

## Broader situations and differentiators

Three situations anchor the message:

- Growth and operational expansion.
- Acquisitions and business transformation.
- Critical leadership transitions.

Explain how the service is supported by:

- Evolving, versioned client briefs that retain earlier priorities.
- Structured candidate discovery and comparison against role requirements.
- Transparent evidence, uncertainty and unanswered questions.
- AI-assisted discussion documents that people review, edit and version.
- Connected workflows from brief to human review.

Technology supports advisory work and human judgment. Do not imply autonomous hiring, independently verified candidate evidence, live AI sourcing or actual manager delivery in this local prototype.

## New seven-section architecture

| Order | Section | Visitor question and job |
|---|---|---|
| 01 | Hero | Why Mandate? Introduce executive-search advice for what comes next, supported by a connected workspace. Preferred headline: **The right leadership for what comes next.** Retain centered copy/actions over existing cinematic media. |
| 02 | Leadership challenges | When is this relevant? **Leadership needs don't stand still.** Three substantial cards: Growth & scale; Acquisitions & transformation; Critical leadership transitions. Use broader product-capability illustrations, not Northline records or candidate facts. |
| 03 | Product value | What makes the experience useful? Explain evolving briefs, structured discovery/comparison, transparent evidence and connected documents. Show interface concepts without client/candidate records, invented scores or business results. Copy/layout to be implemented in a later run. |
| 04 | Our approach | How do we work together? Show advisory understanding, exploration of relevant experience and preparation for human discussion/review. Marketing explanation must not change the real app's three steps. Later run. |
| 05 | Technology and judgment | Where does AI help, and who decides? Explain assistance with organizing information and preparing documents, with visible uncertainty, editing, version history and human review. Later run. |
| 06 | Interactive demo | Can I try it? The **only final-homepage location for the fictional Head of Operations assignment**, candidate names, availability values and Northline documents. Reuse the existing live embed, guided entry and deliberate reset; place this section after the broader proposition. Later run. |
| 07 | Final CTA | What next? Offer Request a conversation and Explore sample workspace. Preserve the existing functional enquiry destination and honest demo limitations. Later run. |

Do not build sections 03–07 in HOME-03. Final ordering is the target for those later runs; do not claim the transitional DOM already matches it.

## Implemented hero and section 02 copy direction

Hero eyebrow remains **Executive search for consequential leadership**. Headline: **The right leadership for what comes next.** This is a direct service proposition for a broader range of leadership needs; it replaces the earlier scenario-opening question without changing hero design.

Body: “Executive-search advice for organizations growing, transforming, or navigating a critical leadership transition. Supported by a connected workspace that keeps priorities, evidence, and discussion in focus.”

Keep both CTA labels and behavior. Header links remain Our approach / Leadership challenges / Sample workspace with valid existing anchors.

Section 02 retains its headline, introductory paragraph, three-card grid, dimensions, hierarchy, palette, hover behavior and responsive stacking. Replace client-specific previews with clearly labeled read-only capability illustrations: define requirements for growth; retain earlier priorities as a brief evolves; compare experience, timing and open questions. These are explanatory illustrations, not actual client records, match outcomes or working controls. Do not add fake controls, stock photographs or generic decorative icons.

## Evidence and scenario boundary

No invented placements, testimonials, client relationships, success rates or commercial outcomes. No whole-candidate “perfect match” claims. Preserve documented, candidate-described, unknown, attention and unmet distinctions in the actual product. Missing evidence becomes a question, not a marketing assertion.

The fictional demo remains intact: Northline Integration Search / Head of Operations shifts from geographic expansion to integrating two acquisitions across 12 locations, with a 60-day availability target. Claire Bennett, Marcus Reed and Daniel Foster supply 30, 45 and 90-day availability. Keep these facts in the dedicated demo, not the general offer or section 02. Reuse domain records and comparison/document logic there; never duplicate business rules for marketing.

Dashboard fixtures such as $250K/+10%, 128 sector candidates, 18 searches and readiness percentages are fictional data, not Mandate results. Keep them inside the explicitly labeled sample workspace; never lift them into marketing counters or proof. Portraits and employer marks in the demo are not client endorsements.

## Visual and functional guardrails

Keep the Concourse-inspired editorial direction: cinematic dark hero, restrained navigation, generous typography/spacing, substantial interface cards and alternating dark/light sections as later sections are implemented. Preserve Mandate's existing Inter, CTA #F9DB74/dark text, page #F9F9F8, white surfaces, dark focus areas and semantic tags. No global design-system rewrite or new asset package.

Website styles remain scoped under `.mandate-home`. Preserve separate desktop/mobile product rules in `docs/DESIGN_SYSTEM.md`. Retain the two supplied hero videos/posters, muted inline sequencing, hidden-tab pause and reduced-motion static fallback. Following the user's refinements, do not restore the removed hero playback button or fictional-advisory caption.

Preserve all existing routes, enquiry validation and `/?conversation=1`, completion/restart/view actions, both local persistence records, candidate membership, source focus, editing/history/sanitization, dirty guards and review rules. Header/hero sample links currently scroll to `#sample-workspace`; do not replace them with locked deep links. Enquiry delivery is not configured: retain the honest local demo form rather than invent an endpoint.

Use one existing live embedded workspace, not repeated App/provider mounts. Never reset on page load, feature selection, guide entry or return. Known guide unlock/dirty-state/iframe-return risks remain documented in the implementation plan and must be resolved in the later demo run.

Acceptance: readable desktop/mobile type and contrasts, 320px reflow, no page-wide overflow, keyboard/focus behavior, reduced motion, valid anchors and relevant checks. Automated accessibility checks are evidence, not a full WCAG certification. HOME-03 ends after strategic alignment, hero/section 02 adjustments and validation.
