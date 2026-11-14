# Mandate Studio v2

A local Vite + React + TypeScript prototype for a fictional executive-search advisory firm. This refines the existing v1 app in place. The website and workspace require no login. The project hub has a presentation-only password gate; it is not server-side authentication.

## Start and review

```sh
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1
```

Open http://127.0.0.1:5173. Start the demo, review the assignment update and revised brief, match candidates, inspect the three profiles and comparison, prepare and edit the discussion brief, then send the saved version for review.

- `/` — public marketing site, interactive real-workspace preview, self-directed demo entry and local simulated enquiry.
- `/workspace` and `/workspace/home` — distinct workspace Home, actual mandate change and deterministic source-aware assistant.
- `/workspace/assignment` — business context, revised mandate, actual change alert, focused history, included profiles, comparison dialog, removed comparison list.
- `/workspace/candidates` — three supplied profiles, semantic shared-criteria comparison, split desktop summary/mobile sheet and full profile.
- `/workspace/experts` — fictional local directory of the same A/B/C records; real search and availability filter.
- `/workspace/discussion` — current version preview, interactive evidence/questions, scoped changes, editing and readiness.
- `/prototype-notes` — project hub linking to the website, demo, design process, Loom walkthrough and repository.
- `/process` — nine-section visual process journey, actual before/refinement captures and proposed human validation.

Candidate deep links `?candidate=A` (also B/C) work on Candidates, Experts, Assignment and Discussion. Assignment query IDs are validated. Invalid paths/IDs offer recovery. Breadcrumbs and stage navigation are links. Embedded previews render the same routes with an in-memory router so they do not consume the host page's browser history.

## Sample behavior

V1 is the earlier approved expansion-focused mandate excerpt. V2 is the current integration draft. Document version IDs are distinct from the product's v2 release label. Candidate facts are immutable supplied fictional material, not independently verified records.

- Home's assistant offers three bounded local responses from actual sample fields. **Insert draft into brief** opens the normal editor; save creates a new draft. No remote AI/network call.
- The assignment alert appears for the real supplied changed-mandate event until acknowledged. No invented prior visit, notification time, activity or unread count. The change remains discoverable afterward.
- A/B/C start included. Remove/Add only changes local comparison membership, never rejection/deletion. Removed records can be re-added; reset restores initial membership. The required discussion always retains all three supplied profiles and explains membership when it differs.
- Summary and full profile share the same data. Overview/Experience/Skills / Technical/Education navigate scroll sections. Unsupported fields and absent profile history are explicit.
- Ready means the exact saved version is **Ready for review**, never approved or sent. Editing changed ready content or restoring creates a new draft requiring fresh review; no-op/cancel preserves the source snapshot.
- Compare versions and restore only V1's supplied mandate section. Candidate evidence/questions remain; the business mandate stays integration. **Update to revised mandate**, save, then explicitly mark ready.
- `/workspace/discussion?scenario=save-failure` arms one failed changed save per visit. The editor retains text; **Retry save** persists it. No random failure or hidden mutator API.
- Two tabs: edit in one, save a different edit in another. Reload saved copy or explicitly keep local edits as a new draft after the latest history.
- Guided sample uses actual same-origin assignment, candidate and discussion screens. Next/Back/Skip/Escape/Close retain host-page context and guard embedded unsaved edits. The separate live-workspace link opens the real app.

Unsaved editing is protected on Close/Escape/backdrop, in-app navigation, browser Back and document exit. A single host navigation guard also protects unsaved edits in the homepage live preview and guided iframe. Hard process termination cannot preserve unsaved memory.

## Storage and recovery

The v1 brief schema/key `mandate-studio:v1` remains unchanged. Validated comparison/acknowledgement preferences use `mandate-studio:v2:preferences`. Reset only removes this prototype's two namespaced keys; unrelated browser data remains. Denied/full storage does not claim durable save. Corrupt brief data stays intact pending explicit recovery or memory continuation. Invalid preference data stays intact and preferences fall back truthfully to memory; reset is explicit.

## Build and checks

```sh
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
pnpm test:e2e
pnpm test:preview
pnpm check
pnpm preview --host 127.0.0.1
```

Use the existing pinned installation. `check` aggregates all six gates. Browser checks require Chromium/loopback execution permission on restricted hosts. If Chromium is absent, the existing setup command is `pnpm exec playwright install chromium`. Run browser/preview suites sequentially to prevent trace-output collisions. Final test output is under `docs/run/mandate-studio-v2/evidence/`. Fixed desktop 1440×1000 and mobile 390×844 capture tests are included; captures alone do not constitute visual acceptance.

The baseline source archive, manifest, test-first receipts, interface/reference locks, actual agent ownership, exact final source/build hashes, acceptance, independent review and handback are under `docs/run/mandate-studio-v2/`. Significant dirty v1 work was preserved before edits; no commit/reset was performed. `baseline-git-status.txt` records the starting state. The scaffold HEAD does not identify the assembled app.

## Design and evidence

The supplied logo SVG bytes/aspect ratios are preserved. Existing Base Nova/Base UI, Inter, Remix and Tailwind 4 remain; no dependency or preset replacement. Yellow is the main CTA accent; neutral surfaces and restrained chart colors establish hierarchy. The 13-page user review, saved Mobbin evidence and current Midday desktop/mobile structure informed bounded adaptations. Private source screenshots are not part of the public bundle. No source site's branding, content, testimonials or business claims are reused.

`public/avatars/profiles.png` is an intentionally generated four-quadrant decorative illustration set: sample consultant, A, B, C. Built-in image generation was used; exact prompt and provenance are recorded in the v2 asset receipt. Portraits are synthetic sample imagery and imply no candidate qualities.

## Limits and remaining personal checks

Frontend only. No authentication/backend, live sourcing, actual AI endpoint, notification/approval service, export/PDF, enquiry transmission or client delivery. Ready is a local simulation. Source alignment guards do not semantically validate arbitrary free text. Comparison choices are local preferences, not recruiting decisions.

Chromium desktop/mobile emulation and sampled keyboard/axe checks are covered. Full screen-reader testing, Safari/Firefox, real-device and human consultant sessions are not claimed. The 200% check is equivalent CSS reflow, not physical browser zoom. **Marcelo's checks: not yet performed.** Personally review copy, self-directed journeys, evidence uncertainty, document trust and visual fit; then run the proposed consultant comprehension check.

## Deployment and submission

Production target: https://futureproofing.marceloambiel.com  
Process document: https://futureproofing.marceloambiel.com/process  
Project hub: https://futureproofing.marceloambiel.com/prototype-notes  
Source: https://github.com/marceloambiel/futureproofing-mandate-studio

Cloudflare Pages uses GitHub integration with `main`, build command `pnpm build`, output `dist`, Node 24.22.2 and pnpm 12.16.1. `public/_redirects` preserves direct SPA routes and refreshes. Deployment verification is recorded separately; listing these targets is not a claim that deployment has succeeded.

The hub password is a client-side presentation gate. It does not protect the public repository, bundled code, media, or direct application routes. The website and demo remain available without authentication. Fresh entry from the website or hub resets only the sample workspace. Navigation inside the demo retains progress.

The company, client records and candidates are fictional. AI-assisted preparation, saving, notifications and review submission are local simulations. No inquiry, document or board submission is delivered. Publishing the prototype does not submit the challenge on the designer’s behalf.
