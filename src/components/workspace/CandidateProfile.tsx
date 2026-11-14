import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react"
import {
  RiArrowLeftLine,
  RiCloseLine,
  RiExpandDiagonalLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { containOverlayFocus } from "@/components/ui/overlay-focus"
import {
  getProfileSections,
  type CandidateId,
  type ProfileSection,
} from "@/domain/v2"
import { mandate, type Candidate, type EvidenceKind } from "@/domain/model"
import "@/features/v2-candidates.css"

const evidenceLabels: Record<EvidenceKind, string> = {
  provided: "Documented in supplied material",
  unverified: "Candidate-described; unverified",
  unknown: "Not established / not supplied",
}

export function EvidenceLabel({ kind }: { kind: EvidenceKind }) {
  return (
    <span className={`workspace-evidence-label workspace-evidence-${kind}`}>
      {evidenceLabels[kind]}
    </span>
  )
}

/** Portraits are decorative; candidate identity and evidence are always text. */
export function CandidateAvatar({
  id,
  className = "",
}: {
  id: CandidateId | "consultant"
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`v2-profile-avatar v2-profile-avatar-${id} ${className}`}
    />
  )
}

function useNarrowProfile() {
  const subscribe = (listener: () => void) => {
    const query = window.matchMedia("(max-width: 1050px)")
    query.addEventListener("change", listener)
    return () => query.removeEventListener("change", listener)
  }
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(max-width: 1050px)").matches,
    () => false
  )
}

function ProfileSections({ candidate }: { candidate: Candidate }) {
  const sections = getProfileSections(candidate)
  const [active, setActive] = useState<ProfileSection>("overview")
  const pane = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef(new Map<ProfileSection, HTMLElement>())
  const tabRefs = useRef(new Map<ProfileSection, HTMLButtonElement>())
  const prefix = useId()

  function select(id: ProfileSection, focus = false) {
    setActive(id)
    const container = pane.current
    const section = sectionRefs.current.get(id)
    if (container && section) {
      // Only this pane scrolls; immediate positioning avoids scroll/observer races.
      container.scrollTop +=
        section.getBoundingClientRect().top -
        container.getBoundingClientRect().top
    }
    if (focus) tabRefs.current.get(id)?.focus()
  }
  function followVisibleSection() {
    const container = pane.current
    if (!container) return
    const bounds = container.getBoundingClientRect()
    const visible = sections
      .map((section) => ({
        id: section.id,
        node: sectionRefs.current.get(section.id),
      }))
      .filter((item): item is { id: ProfileSection; node: HTMLElement } =>
        Boolean(item.node)
      )
      .filter(({ node }) => {
        const rect = node.getBoundingClientRect()
        return rect.bottom > bounds.top + 10 && rect.top < bounds.bottom
      })
    const nearTop =
      visible.find(
        ({ node }) => node.getBoundingClientRect().bottom > bounds.top + 70
      ) ?? visible[0]
    if (nearTop) setActive(nearTop.id)
  }
  function keyNavigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % sections.length
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index + sections.length - 1) % sections.length
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = sections.length - 1
    else return
    event.preventDefault()
    select(sections[next].id, true)
  }

  return (
    <div className="v2-profile-sections">
      <div
        role="tablist"
        aria-label={`${candidate.name} profile sections`}
        className="v2-profile-tabs"
      >
        {sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            role="tab"
            id={`${prefix}-tab-${section.id}`}
            aria-controls={`${prefix}-section-${section.id}`}
            aria-selected={active === section.id}
            tabIndex={active === section.id ? 0 : -1}
            ref={(node) => {
              if (node) tabRefs.current.set(section.id, node)
              else tabRefs.current.delete(section.id)
            }}
            onClick={() => select(section.id)}
            onKeyDown={(event) => keyNavigate(event, index)}
          >
            {section.label}
          </button>
        ))}
      </div>
      <div
        className="v2-profile-scroll"
        ref={pane}
        onScroll={followVisibleSection}
      >
        {sections.map((section) => (
          <section
            key={section.id}
            id={`${prefix}-section-${section.id}`}
            role="tabpanel"
            aria-labelledby={`${prefix}-tab-${section.id}`}
            tabIndex={0}
            className="v2-profile-section"
            ref={(node) => {
              if (node) sectionRefs.current.set(section.id, node)
              else sectionRefs.current.delete(section.id)
            }}
          >
            <h2>{section.label}</h2>
            {section.id === "overview" ? (
              <>
                <h3>Supplied statement</h3>
                <EvidenceLabel
                  kind={candidate.id === "C" ? "unverified" : "provided"}
                />
                <p>{candidate.statement}</p>
                <dl className="v2-profile-facts">
                  <div>
                    <dt>Availability</dt>
                    <dd>
                      <strong>{candidate.availabilityDays} days</strong>
                      <span>
                        {candidate.availabilityDays > mandate.startWithinDays
                          ? "Beyond start target"
                          : "Within start target"}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Client target</dt>
                    <dd>Within {mandate.startWithinDays} days</dd>
                  </div>
                </dl>
                <div className="workspace-note-panel">
                  <h3>Limitation to carry forward</h3>
                  <p>{candidate.limitation}</p>
                  <h3>Next question</h3>
                  <p>{candidate.question}</p>
                </div>
              </>
            ) : section.id === "experience" ? (
              <>
                <p>{section.text}</p>
                <h3>Integration experience</h3>
                <EvidenceLabel kind={candidate.integration.kind} />
                <p>{candidate.integration.text}</p>
                <h3>Operating scale</h3>
                <EvidenceLabel kind={candidate.scale.kind} />
                <p>{candidate.scale.text}</p>
                <p className="workspace-muted">
                  No employer names, dates, CV or interview record were
                  supplied.
                </p>
              </>
            ) : (
              <p>{section.text}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

export function CandidateProfile({
  candidate,
  onClose,
  returnLabel = "Back to comparison",
}: {
  candidate: Candidate
  onClose: () => void
  returnLabel?: string
}) {
  const narrow = useNarrowProfile()
  const [returnFocus] = useState(() =>
    document.activeElement instanceof HTMLElement &&
    document.activeElement !== document.body
      ? document.activeElement
      : null
  )
  const [full, setFull] = useState(false)
  const summaryRef = useRef<HTMLElement>(null)
  const fullTrigger = useRef<HTMLButtonElement>(null)
  const title = useId()
  const description = useId()
  useEffect(() => {
    if (!narrow) summaryRef.current?.focus({ preventScroll: true })
    return () => {
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
      else {
        const heading = document.querySelector<HTMLElement>("main h1")
        if (heading) {
          heading.tabIndex = -1
          heading.focus({ preventScroll: true })
        }
      }
    }
  }, [narrow, returnFocus])

  const identity = (
    <div className="v2-profile-identity">
      <CandidateAvatar id={candidate.id} />
      <div>
        <p className="workspace-eyebrow">
          Supporting evidence · Fictional sample
        </p>
        <h2 id={title}>{candidate.name}</h2>
        <p id={description} className="workspace-muted">
          Head of Operations · Supplied starting material
        </p>
      </div>
    </div>
  )
  const content = (
    <>
      <ProfileSections key={candidate.id} candidate={candidate} />
      <footer className="v2-profile-footer">
        <p className="workspace-muted">
          No independent verification was supplied.
        </p>
        <Button
          ref={fullTrigger}
          variant="outline"
          onClick={() => setFull(true)}
        >
          View full profile
          <RiExpandDiagonalLine aria-hidden="true" />
        </Button>
        <Button variant="ghost" onClick={onClose}>
          <RiArrowLeftLine aria-hidden="true" />
          {returnLabel}
        </Button>
      </footer>
    </>
  )

  return (
    <>
      {narrow ? (
        <Sheet
          open
          onOpenChange={(open) => {
            if (!open && !full) onClose()
          }}
        >
          <SheetContent
            className="v2-profile-mobile"
            finalFocus={() => returnFocus}
            onKeyDown={(event) => {
              if (!full) containOverlayFocus(event)
            }}
          >
            <SheetHeader>
              <div className="v2-profile-identity">
                <CandidateAvatar id={candidate.id} />
                <div>
                  <p className="workspace-eyebrow">Supporting evidence</p>
                  <SheetTitle>{candidate.name}</SheetTitle>
                  <SheetDescription>
                    Fictional sample · Head of Operations
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
      ) : (
        <aside
          ref={summaryRef}
          className="v2-profile-summary"
          role="dialog"
          aria-modal="false"
          aria-labelledby={title}
          aria-describedby={description}
          tabIndex={-1}
          onKeyDown={(event) => {
            if (full || event.defaultPrevented) return
            if (event.key === "Escape") {
              event.preventDefault()
              event.stopPropagation()
              onClose()
            } else containOverlayFocus(event)
          }}
        >
          <header className="v2-profile-header">
            {identity}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              onClick={onClose}
            >
              <RiCloseLine aria-hidden="true" />
            </Button>
          </header>
          {content}
        </aside>
      )}
      <Dialog open={full} onOpenChange={setFull}>
        <DialogContent
          className="workspace-dialog v2-full-profile"
          finalFocus={fullTrigger}
        >
          <DialogHeader>
            <DialogTitle>{candidate.name} · Full profile</DialogTitle>
            <DialogDescription>
              The same supplied sample record, with evidence limitations
              retained. No CV or independent verification is available.
            </DialogDescription>
          </DialogHeader>
          <div className="v2-full-profile-layout">
            <ProfileSections
              key={`${candidate.id}-full`}
              candidate={candidate}
            />
            <aside className="v2-profile-history">
              <h2>Profile history</h2>
              <p>No profile history in this sample</p>
              <p className="workspace-muted">
                Comparison membership records a local workspace choice, not a
                change to candidate evidence.
              </p>
            </aside>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
