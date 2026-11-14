# Implemented requirement-facing test matrix

The predefined contract is authoritative. Tests were authored before production features; owner preserved the first unit and E01 red receipts. No skipped/focused tests or pass-with-no-tests mode is used.

| Contract IDs | Executable evidence |
| --- | --- |
| D01–D08 | `unit/domain.test.ts`: supplied facts/evidence kinds, historical/current separation, ready idempotence, changed-ready snapshots, no-op save, restore scope, alignment guard, questions preserved |
| D05, D09–D14 | `unit/persistence.test.ts`: cancel, failure/retry, whitespace validation, round trip, corrupt/unsupported/invalid state, read/write denial, stale revision, namespaced reset |
| U01–U07, U09 | `e2e/journey.spec.ts`: correct evidence/focus return, all candidates, prepared discussion, validated editor, version/restore confirmation, persistent ready/edit, error retry, dirty close/Escape |
| U08, U10 | `e2e/recovery.spec.ts`: associated enquiry errors/no transmission, rapid ready/restore, explicit corrupt-data recovery and reset cancel |
| E01–E06 | `e2e/journey.spec.ts`: desktop linked journey, paired versions, fresh review, restore realignment, failed save reload, direct route/back/forward/invalid ID recovery |
| E07–E10 | `e2e/responsive-accessibility.spec.ts`: 320/390/768/1440px layouts, full mobile journey/restore/error, keyboard-only journey and modal containment, axe all main views/open overlays, 200% equivalent reflow, reduced motion/rapid reversal |
| E11 | `e2e/responsive-accessibility.spec.ts`: visual process sections/images, honest AI/check disclosure, reviewer access/scenario instructions |
| E12 | `e2e/production.spec.ts` with preview config: built deep links, all images, supplied logo files and runtime/console errors |

Tests verify sampled behaviors, not WCAG conformance or comprehensive usability. A 720 CSS-pixel viewport models reflow of a 1440px desktop at 200%; it does not claim actual browser zoom was manually exercised. Screenshots are captured as Playwright output artifacts; passing capture alone is not visual inspection. Reference fidelity, exact public HTTPS delivery and human-only checks remain manual acceptance obligations.
