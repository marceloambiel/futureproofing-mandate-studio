# MANDATE STUDIO — Process Journey Source of Truth

**Purpose:** Editorial copy and evidence plan for the existing prototype's `/process` page.  
**Target:** Eight concise, visual-first chapters, a public prototype process-journey link, and an evidence appendix kept off the main narrative.  
**Prepared:** November 14, 2026.  
**Status:** Content draft based on original challenge, recovered ChatGPT discussion, the designer's narrated Loom transcript, and screenshots shared in the conversation. **Not a substitute for inspecting the current repository, Git changes, or final live app.**

## Provenance and truth labels

- **[BRIEF]** Original HackerEval / FutureProofing challenge reproduced by the designer on November 14, 2026.
- **[WALKTHROUGH]** Designer's 4:44 narrated Loom transcript supplied in the conversation, November 13, 2026. Establishes observed or described demo interactions, not independent technical QA.
- **[DESIGN DECISION]** Decisions and critiques recorded across the user's Mandate Studio / FutureProofing chats, mainly November 8–13, 2026.
- **[SCREENSHOT]** Supplied first-generation homepage screenshot (November 13), embedded dashboard screenshot, original brief screenshot, Concourse reference screenshot.
- **[USER REPORT]** On November 14, designer reports the app and website are finalized for mobile and desktop. Independent browser test results are not supplied.
- **[VERIFY]** Must be checked in the finalized repository or by interacting with the current prototype before publishing a claim as completed.
- **[PROPOSED]** Suggested future evaluation, success measures, and later product work. Not completed research.

**Editorial guardrails:** No invented user interviews, test participants, measured gains, successful placements, revenue, client endorsements, completed AI integration, or accessibility audit. Do not claim a Codex prompt was executed solely because a prompt was written. No actual hiring winner is required. Preserve the candidate evidence exactly. Display fictional/demo status clearly.

---

# PUBLIC PAGE CONTENT — 8 VISUAL CHAPTERS

## Process hero (not counted as a chapter)

**Kicker:** CASE STUDY / PRODUCT DESIGN / NOVEMBER 2026  
**Title:** Designing clarity into executive search.  
**Deck:** From a changing client mandate to a review-ready discussion: how I designed a connected consultant workflow and a responsive advisory website for Mandate Studio, a fictional executive-search firm.  
**Context strip:** Responsive homepage · Consultant workflow · Synthetic data · Interactive prototype  
**Link:** Explore the live experience  
**Disclosure:** Mandate Studio is a fictional company created for a design challenge. All client and candidate information is synthetic.

**Visual:** One polished composition using real final homepage, assignment and discussion-editor screenshots. Do not render a fake generic dashboard. Prefer real CSS-composed captures or actual route screenshots. If no final captures exist yet, take them from the current running prototype.

---

## 01 — The challenge

**Eyebrow:** 01 / THE BRIEF  
**Headline:** A leadership search where the question changed midway.  
**Main copy:** The assignment was to design two connected experiences: a public homepage explaining Mandate Studio's executive-search approach, and a consultant workspace for turning a revised client brief and incomplete candidate information into a clear discussion. The challenge valued judgment over a polished but ungrounded recommendation.  
**Problem card:** A company operating 12 locations needs a Head of Operations. Its board has changed the priority from geographic expansion to integrating two recent acquisitions. The new leader should be available within 60 days, while the previously approved brief still emphasizes expansion.  
**Design challenge:** How might a consultant recognize what changed, assess candidates fairly against the *current* requirements, and prepare an honest discussion without confusing an outdated approved document with the latest recommendation?  
**Scope card:** One responsive advisory homepage; a clickable consultant journey of roughly 3–5 key screens/states; desktop/mobile behavior; sample data and simulated interactions permitted; visual process explanation required.

**Visual direction:** Show a compact annotated original → revised mandate diagram, beside the challenge constraints. Make the changed priority and the 60-day constraint visually legible.

---

## 02 — Understanding the problem

**Eyebrow:** 02 / PROBLEM FRAMING  
**Headline:** The challenge wasn't to rank candidates. It was to make the reasoning visible.  
**Main copy:** The fictional profiles deliberately resist an easy answer. A has scaled operations but lacks established integration experience. B has led integrations but needs clarification on operating scale. C describes both kinds of work, but the integration scope is unverified and the candidate cannot meet the 60-day target. Turning these facts into a definitive score would conceal precisely what the client needs to discuss.  
**Principle:** Separate **documented evidence**, **potential concerns**, and **unknowns to verify**. A requirement-level match is not an endorsement of the whole person.  
**Two audiences:** Prospective client: “Can this firm understand my business and explain how a search works?” Consultant: “What changed, what do we actually know, and what do I need the board to review?”  
**Prioritization:** The revised business need and mandatory timing must appear before a candidate recommendation, because they change the meaning of every comparison.

**Evidence matrix:**

| Profile | Documented or stated information | Limitation or question |
|---|---|---|
| A | Expanded operations from 4 to 12 locations; available in 30 days | Acquisition-integration experience has not been established |
| B | Led 2 acquisition integrations; available in 45 days | 12-location operational management needs clarification |
| C | Describes growth and integration work; available in 90 days | Scope unverified; availability exceeds target |

**Visual direction:** Show three matched-height candidate evidence cards plus a slim priority-change banner. Do not illustrate a winner. Use evidence-status labels with color *and* words.

---

## 03 — Designing the journey

**Eyebrow:** 03 / USER JOURNEY  
**Headline:** One connected path, from changed requirements to a better conversation.  
**Main copy:** I organized the consultant's work into a sequence that answers one question at a time. The dashboard announces a brief update; the assignment view establishes the new context and retains previous versions; candidate discovery and comparison expose both fit and uncertainty; the discussion editor turns findings into a document that can be revised before review.  
**Flow:** Dashboard update → Review revised assignment and previous brief → Discover, inspect and compare candidates → Prepare and edit discussion brief → Save version and submit for board review → See completed assignment state.  
**Hierarchy decision:** Assignment context and what changed first; candidate evidence second; discussion and next questions third; review and completion last.  
**Guardrail:** Previously approved content must remain identifiable as historical. Editing or restoring content must create a new review requirement rather than silently inheriting prior approval. **Verify exactly how this is enforced in the final app before labeling it implemented.**  
**Scope decision:** Preserve the actual application shell and create a guided entry point within it rather than an isolated linear slideshow.

**Visual direction:** Horizontal journey on desktop and vertical on mobile, with six small authentic UI screenshots. Indicate current/previous version and review-required state in the flow. Screenshot names: dashboard notification, assignment brief, comparison, editor, review, completed dashboard.

---

## 04 — Making the workflow tangible

**Eyebrow:** 04 / PRODUCT EXPERIENCE  
**Headline:** Every interaction should expose a useful piece of the decision.  
**Main copy:** The prototype uses a recognizable workspace shell, but focuses the guided task on the updated assignment. The consultant can inspect the full brief and its structured breakdown, compare the earlier and revised versions, investigate candidate profiles, refine the shortlist, and prepare an editable discussion document.  

**Interaction sequence and rationale:**

**01. The update is the entry point.** A notification and current-assignment prompt signal that something important changed. Other dashboard areas provide realistic context rather than competing with the core journey.  
**02. The brief is readable in two forms.** Full client narrative on one side; structured breakdown on the other, so the consultant can scan requirements while understanding why they matter. Current and previous versions remain accessible, and the brief can be edited.  
**03. Candidate evidence stays inspectable.** The candidate list summarizes location, relevant experience, mismatches, and unknowns. A side drawer offers a full profile without losing comparison context. Candidates can be added or removed from the working set.  
**04. Comparison follows the mandate.** A requirement-by-candidate matrix shows alignment, potential issues, and items to confirm. Green/yellow/confirmation states are explained in words, not treated as a definitive candidate ranking.  
**05. The discussion is an editable artifact.** An AI-assisted sample draft summarizes the evidence; the consultant reviews and edits it, can inspect earlier versions, saves a new version, and sends the result for board review. The flow ends with a completed-assignment state on the home screen.  

**Simulation note:** A clickable, simulated document preview/version interaction meets the challenge. Do not claim live AI generation, durable backend saving, real review delivery or export unless the actual implementation proves it.

**Visual direction:** A large scrollable collage with five full-size, cropped actual product captures, each paired with one decision annotation. Use authentic UI components. Provide mobile adaptation for the most important comparison or assignment screen.

---

## 05 — Brand and website

**Eyebrow:** 05 / BRAND & WEBSITE  
**Headline:** The homepage needed to sell the approach—not narrate the demo.  
**Main copy:** The first website direction combined a photographic hero, an embedded interactive workspace near the top, and several informational sections. It demonstrated the prototype quickly, but gave too much space to the fictional assignment and not enough to why a prospective client would choose Mandate's approach. That critique changed the content architecture.  
**Strategic shift:** From **demo-first marketing** to **business problem → service value → approach → capabilities → dedicated interactive example → conversation**.  
**Brand idea:** Clarity through change. The website explains which leadership challenges the firm helps with—growth, integration, and critical transitions—before showing real workspace components as evidence of how it operates.  
**Design reference:** Concourse.ai provided structural inspiration: editorial typography, cinematic dark hero, alternating light/dark sections, sizeable product-component cards, strong navigation, and restrained motion. Mandate retains its own naming, content, color character, and components.  
**Demo placement:** One dedicated section invites visitors to “step into the consultant's seat” and respond to a last-minute change of scope. The existing dashboard expands from its embedded homepage frame into the full-screen guided application.  
**Two actions:** Prospective clients get a clear conversation CTA; curious visitors get a frictionless sample-workspace CTA.

**Visual direction:** A real before/after layout comparison: early screenshot (photographic hero, embedded demo high on page, simple information sections) against the final public homepage. Beneath: three actual cropped product cards used in the marketing site. Include a small source acknowledgment for the Concourse layout reference, not a logo implying partnership.

---

## 06 — Iteration and trade-offs

**Eyebrow:** 06 / DECISIONS & TRADE-OFFS  
**Headline:** I kept the reasoning, not every possible feature.  
**Main copy:** The work progressed through short, focused design-and-code iterations rather than a single large speculative rebuild. I used ChatGPT to structure the brief, challenge the content strategy, and write scoped implementation directions; Codex CLI was used to work against the existing React/Vite prototype. The goal was to keep an already functional consultant flow intact while improving the public experience.  

**Decisions to show:**

| Option considered | Direction chosen | Why |
|---|---|---|
| One definitive best-candidate score | Evidence, trade-offs and next questions | The brief has no necessary winner; certainty would misrepresent incomplete data |
| Static brief snapshot | Current and previous versions, with revision context | The key challenge is a mid-search change of priority |
| A separate demo landing flow | Reuse real dashboard and expand it full-screen | Keeps the sample interaction connected to the same product |
| Generic illustrations or stock visuals | Authentic product-component cards | Shows capabilities rather than decorating claims |
| Homepage built around fictional candidate facts | Broad client benefits plus a dedicated sample-demo section | Makes the site useful to a prospective client, not only challenge reviewers |
| Full backend/auth/paid AI integration | Focused simulated experience | Scope calls for a coherent interaction, not unnecessary infrastructure |

**Meaningful changed decision:** The homepage strategy was explicitly revised after feedback that it was “too focused on the demo info.” The later structure sells the executive-search service and its working method; a single demo section then invites a hands-on scenario.  
**Implementation discipline:** The known initial local MVP was preserved. On November 13 the designer reported completing Codex RUN 00–02 before the strategy correction. Subsequent RUN 03–10 instructions were planned in focused batches; **do not describe them as executed or committed without validating local Git/repository evidence**.

**Visual direction:** Feature the homepage content architecture **before vs after** as the central iteration, plus two compact decision cards (“No forced winner” and “Historic approval ≠ current review”). If git history confirms additional visual changes, add exact before/after captures and dates.

---

## 07 — Validation and accessibility

**Eyebrow:** 07 / CHECKING THE WORK  
**Headline:** A believable prototype still needs to be understandable.  
**Main copy:** The experience was designed for a responsive homepage and a usable consultant journey. The designer reports both desktop and mobile versions finalized. Before publishing this process page, the final route and the underlying application should be checked in the browser, with recorded results separated from untested intentions.  

**Check list — record PASS/FAIL/NOT TESTED from real evidence:**

- Visitor understands Mandate's leadership challenges, approach, and two next steps.
- Embedded dashboard activation expands the actual demo, and return to the website is clear.
- Consultant notices the changed brief and can identify the old version as historical.
- Candidate data remains consistent, including unknowns and 30/45/90-day availability against the 60-day target.
- Candidate profile, comparison, document editing, version selection and review-state interactions behave coherently.
- A revised/restored approved document is not incorrectly presented as the current approved recommendation.
- Narrow viewport: no clipped evidence labels, unusable comparison, accidental horizontal overflow, or inaccessible buttons.
- Keyboard: logical focus order, visible focus, usable controls, expansion/exit behavior.
- Motion: reduced-motion support where animation exists.
- Incomplete/error/completion: provide understandable behavior in the chosen simulated workflow.

**Usability validation proposed (not completed unless documented):** Give another consultant the sample workspace without explanation. Ask them to (1) identify the changed priority and timing constraint, (2) explain what is supported and unknown for A/B/C, and (3) outline a client discussion and locate its review state. Record whether they complete each task unassisted, how long it takes, and where they misinterpret the evidence.  
**Suggested success measure [PROPOSED]:** At least 4 of 5 independent test participants can accurately explain the revised mandate, distinguish evidence from unknowns, and identify a justified next question without facilitator guidance. This is a target, **not a measured outcome**.

**Visual direction:** Use actual desktop/mobile screenshots of the same assignment or comparison state, followed by a compact QA matrix with sourced results. Do not create fake green pass marks or fabricated quotes.

---

## 08 — Outcome and reflection

**Eyebrow:** 08 / OUTCOME & NEXT STEPS  
**Headline:** A working journey, with the important uncertainty left intact.  
**Main copy:** The delivered concept connects a public executive-search homepage to an interactive consultant workflow. The story starts with a changed client mandate and ends with an editable discussion prepared for review—not an invented perfect candidate. The website introduces the firm's value; the product demonstrates what transparent judgment looks like.  
**Delivered [USER REPORT; VERIFY LINKS]:** Responsive website (desktop/mobile), interactive consultant application, integrated full-screen demo entry, and process-journey page being finalized.  
**Scope boundaries:** Fictional firm and data; no verified commercial placements; no necessary live backend, authentication, paid API, or genuine production review submission. Any AI drafting, saving or exports are described according to actual implementation.  
**What I would test next:** Independent consultant comprehension; clearer language for match/warning/unknown states; usability of comparison on a narrow screen; review-state accuracy after restoring a prior version.  
**Reflection:** The biggest design improvement came from reframing what needed to be sold. The marketing site should explain the value of Mandate as a service; the hands-on sample should show how the work happens under pressure.  
**Final actions:** Explore live prototype · Return to homepage.  
**Disclosure:** This is a fictional prototype created for the FutureProofing challenge. Verify permission with the recruiting team before publishing it as a portfolio case study.

**Visual direction:** Large final website and application capture, a compact deliverables strip, and one clearly labeled “What I would measure next” card.

---

# SUPPORTING EDITORIAL NOTES — NOT ALL VISIBLE AT ONCE

## What belongs first in the client meeting

1. **Restate the revised business question:** integration of two acquisitions now outweighs the earlier emphasis on geographic expansion; role has 12-location scope; desired start within 60 days.
2. **Explain what changed from the approved brief:** make the difference explicit, with version/date/status if the implementation supports it.
3. **Compare the evidence, not people as scores:** A has demonstrated scale; B has demonstrated integrations; C's integration scope is unverified and timing conflicts with the target.
4. **Surface decision-critical questions and next actions:** distinguish immediate facts to confirm from later due diligence.
5. **Explain review status:** the consultant's current working recommendation is not automatically the formerly approved document.

**Leave out of the meeting opening:** Full profile dumps, generic dashboard metrics, AI implementation details, every low-priority field, arbitrary composite fit scores, and a premature winner. These can remain available in supporting detail.

## Next questions to investigate

- **For the client:** Is acquisition integration a non-negotiable requirement or a preference relative to scale? What is the minimum operational breadth required? How fixed is the 60-day start target? Which integration outcomes would count as relevant evidence?
- **For Candidate A:** What actual involvement, if any, did they have in acquisition integration? Was growth primarily organic? What integration responsibilities can be documented?
- **For Candidate B:** How many sites, teams and operating units were within their direct management remit during and after the two integrations? What scope is documented?
- **For Candidate C:** Which integration initiatives did they directly lead, with what scale and outcomes? Can the 90-day timing change, or is the timing constraint disqualifying?

## Versioning and review safeguard

**Design requirement from original challenge:** The earlier approved client brief must remain identifiable as an earlier approved version; new edited/restored content must require fresh review. The latest version must not inherit an old approval badge simply because it was created from approved content.

**Recommended display logic to verify against the actual prototype:** `Previous / Approved` and `Current / Draft` labels, visible change indicator, review pending after edits/restores, a clear ready-for-review action. Do not claim server-side enforcement or a particular implementation until inspected.

## Chronology of supported decisions

| Date | Source-supported milestone | Certainty |
|---|---|---|
| Nov 6, 2026 | Replacement asynchronous prototype challenge invitation issued; original website-improvement challenge paused | Prior conversations / invitation |
| Nov 8 | Designer emphasized that an MVP was already running on localhost; challenge framed around revised mandate and 3 candidates | Prior conversations |
| Nov 9 | Existing React/Vite project was inspected for Codex CLI workflow, focusing on small iterative edits; existing work preserved | Prior conversation |
| Nov 13 | Designer supplied an end-to-end narrated product walkthrough detailing the notification, updated brief, candidate assessment, AI-assisted discussion, versioning, review and completion | First-hand transcript |
| Nov 13 | Concourse.ai chosen as section-layout inspiration; authentic product-component cards favored over generic stock imagery | Designer decisions |
| Nov 13 | Current marketing screenshot reviewed; keep existing app and demo rather than restart from scratch | Designer/assistant review |
| Nov 13 | RUN 00, 01, 02 reported completed; proposed next runs changed from demo-specific to client-value positioning | User-confirmed for 00–02; later prompts proposed |
| Nov 13 | Designer explicitly corrected the strategy: website should sell the product; last-minute scope-change scenario belongs in one standalone interactive demo section | Designer decision |
| Nov 14 | Designer reports website and app finished for desktop and mobile; process document remains the required final deliverable | User report |

## Actual tool disclosure to verify before publication

- **ChatGPT:** Brief synthesis, strategic direction, UX writing, homepage critiques, scoped Codex prompts, process structure. Confirm exactly which drafts/decisions were adopted.
- **Codex CLI:** Implementation/editing workflow in the existing local React/Vite project. Capture actual model/version only if accessible; do not invent.
- **React/Vite:** Prior local project information indicates this environment. Verify current package.json and deployment route before publication.
- **Loom:** Designer narrated the completed app's actual click-through, used to confirm sequence and features.
- **Concourse.ai:** Visual layout and product-card presentation reference, not an approved partnership, user research sample, or source of Mandate functionality.
- **Browser/dev tools:** Include specific browsers, viewports, build/test commands, and results **only after reading real reports or running them**.

## Screenshots/visual artifacts to capture from current app

1. Final public homepage hero and one authentic product card, desktop.
2. Earlier homepage version (from git history, or supplied screenshot if accessible), matched side-by-side with final.
3. Embedded demo dashboard on the marketing page.
4. Dashboard notification and highlighted assignment.
5. Current brief beside historical approved brief, including status and changes.
6. Candidate list with evidence statuses plus profile drawer.
7. Candidate comparison matrix showing differences, unknowns and timing.
8. Discussion brief editor, version history and board-review state.
9. Completion state back on home.
10. The same meaningful screen at desktop and narrow viewport.

## Page production criteria

- Visually designed eight-chapter case study, not a wall of text.
- Use the existing Mandate design tokens and editorial visual hierarchy, appropriate contrast, strong responsive behavior.
- Anchor navigation for chapters, visible active section if convenient, accessible headings, alt text, keyboard focus.
- Source visuals from the final application and actual historical revisions, not guessed mockups.
- Avoid duplicating large portions of the app; use annotated captures and diagrams in `/process`.
- Evidence distinctions visibly mark **Implemented**, **Reported**, **Proposed**, **Not tested** where needed.
- Only one core success-metric proposal; no falsely measured outcomes.
- Include direct return/try-prototype CTA, but never accidentally start or reset the actual interactive assignment from `/process`.
- Do not break the homepage, demo, routing or application state.
