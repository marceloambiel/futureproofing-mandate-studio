import { useEffect, useRef, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  RiArrowRightLine,
  RiArrowUpLine,
  RiPlayFill,
  RiArrowRightUpLine,
} from "@remixicon/react"
import { candidates } from "@/domain/model"
import { captureSizes } from "./process/capture-sizes"
import "./process/process-journey.css"

const chapters = [
  ["challenge", "The challenge"],
  ["reasoning", "The evidence"],
  ["journey", "The journey"],
  ["experience", "The experience"],
  ["website", "The website"],
  ["decisions", "The decisions"],
  ["production", "The production"],
  ["validation", "The checks"],
  ["reflection", "What’s next"],
] as const
const base = "/process/journey/"
function Capture({
  file,
  alt,
  caption,
  priority = false,
  className = "",
}: {
  file: string
  alt: string
  caption: string
  priority?: boolean
  className?: string
}) {
  const [width, height] = captureSizes[file] ?? [1440, 1000]
  return (
    <figure className={`journey-capture ${className}`}>
      <a
        href={`${base}${file}`}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open full-size capture: ${alt}`}
      >
        <img
          src={`${base}${file}`}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </a>
      <figcaption>
        {caption}
        <a href={`${base}${file}`} target="_blank" rel="noreferrer">
          Full-size image
          <RiArrowRightUpLine aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  )
}
function Chapter({
  id,
  number,
  label,
  title,
  intro,
  children,
}: {
  id: string
  number: string
  label: string
  title: string
  intro: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      data-process-section
      className="journey-chapter"
      aria-labelledby={`${id}-title`}
    >
      <div className="journey-container">
        <header className="journey-chapter-heading">
          <p className="journey-chapter-label">
            <span>{number}</span>
            {label}
          </p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p className="journey-deck">{intro}</p>
        </header>
        {children}
      </div>
    </section>
  )
}
function Evidence({
  children,
  kind = "verified",
}: {
  children: ReactNode
  kind?: "verified" | "intent" | "proposed" | "simulated" | "historical"
}) {
  return <span className={`journey-evidence is-${kind}`}>{children}</span>
}
const questions = [
  "What acquisition-integration responsibility did Claire personally hold, and what evidence supports it?",
  "How many locations and teams did Marcus directly oversee during and after the integrations?",
  "Which integrations did Daniel personally lead, and can his 90-day availability meet the 60-day target?",
]
const journey = [
  [
    "dashboard-notification.jpg",
    "Notice the update",
    "A changed priority is the entry point.",
  ],
  [
    "assignment-desktop.jpg",
    "Review the mandate",
    "Current requirements before candidate evidence.",
  ],
  [
    "comparison-desktop.jpg",
    "Explore the evidence",
    "Profiles, working selection and comparison.",
  ],
  [
    "discussion-editor-desktop.jpg",
    "Prepare the discussion",
    "A local sample draft, reviewed and edited.",
  ],
  [
    "review-confirmation.jpg",
    "Send for review",
    "Explicit confirmation of the saved version.",
  ],
  [
    "completed-dashboard.jpg",
    "Close the loop",
    "A submitted summary replaces the active task.",
  ],
]

export function Process() {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState("challenge")
  useEffect(() => {
    const previous = document.title
    document.title = "Mandate Studio — Design process"
    let frame = 0
    const update = () => {
      frame = 0
      const sections = Array.from(
        root.current?.querySelectorAll<HTMLElement>("[data-process-section]") ??
          []
      )
      const current = sections
        .filter((section) => section.getBoundingClientRect().top <= 220)
        .at(-1)
      setActive(current?.id ?? "challenge")
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    update()
    return () => {
      document.title = previous
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [])
  return (
    <div ref={root} className="process-journey" id="process-top">
      <a className="journey-skip" href="#process-main">
        Skip to the case study
      </a>
      <header className="journey-header">
        <div className="journey-container">
          <Link className="journey-project-brand" to="/prototype-notes">
            <span>Future Proofing Challenge</span>
            <span className="journey-project-author">by Marcelo Ambiel</span>
          </Link>
          <nav aria-label="Process page navigation">
            <Link to="/prototype-notes">Project hub</Link>
            <Link to="/">Website</Link>
            <Link to="/workspace">Demo</Link>
            <Link to="/process" aria-current="page">
              Design process
            </Link>
            <a
              href="https://www.loom.com/share/979f7219f3ff46a5aa9f961a9a196160"
              target="_blank"
              rel="noreferrer"
            >
              Loom
            </a>
            <a
              href="https://github.com/marceloambiel/futureproofing-mandate-studio"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>
      <div className="journey-layout">
        <aside className="journey-sidebar">
          <nav className="journey-index" aria-label="Case study chapters">
            <p className="journey-contents-label">On this page</p>
            <div className="journey-container">
              {chapters.map(([id, title], index) => (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={active === id ? "location" : undefined}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {title}
                </a>
              ))}
            </div>
          </nav>
        </aside>
        <main id="process-main">
          <section className="journey-hero" aria-labelledby="process-title">
            <div className="journey-container">
              <p className="journey-overline">
                Mandate Studio / Product design / November 2026
              </p>
              <h1 id="process-title">
                Designing clarity into
                <br className="journey-desktop-break" /> executive search.
              </h1>
              <p className="journey-hero-deck">
                A changing mandate. Incomplete evidence. One connected path to a
                conversation worth having.
              </p>
              <div className="journey-context-strip">
                <span>Responsive advisory website</span>
                <span>Consultant workflow</span>
                <span>Fictional data</span>
                <span>Interactive prototype</span>
              </div>
              <div className="journey-hero-art">
                <Capture
                  file="website-desktop.jpg"
                  alt="Final Mandate website with the headline The right leadership for what comes next"
                  caption="The company proposition: explain the leadership question before introducing the product."
                  priority
                />
                <Capture
                  file="assignment-desktop.jpg"
                  alt="Final desktop assignment overview with the revised client brief and structured requirements"
                  caption="The product proposition: keep the changed mandate and its evidence together."
                  priority
                />
              </div>
              <p className="journey-disclosure">
                A fictional executive-search firm, created for the
                FutureProofing prototype challenge. All client and candidate
                records are synthetic. Screens shown here are genuine captures
                of the local prototype.
              </p>
            </div>
          </section>

          <Chapter
            id="challenge"
            number="01"
            label="The brief"
            title="The role stayed the same. The business question changed."
            intro="Design a public advisory website and a consultant journey that turns a revised client mandate into an honest, review-ready discussion."
          >
            <div className="journey-split">
              <div className="journey-prose">
                <h3>A change that changes the search</h3>
                <p>
                  A 12-location business needs a Head of Operations. Two
                  acquisitions shift the priority from geographic expansion to
                  integration. The leader should start within 60 days, but the
                  earlier approved brief still describes expansion.
                </p>
                <p>
                  The design task was to make that change unmistakable, compare
                  incomplete evidence fairly, and prepare the next conversation.
                </p>
                <Evidence kind="intent">Design goal</Evidence>
                <p className="journey-pullquote">
                  Make the reasoning visible before making a recommendation.
                </p>
              </div>
              <div
                className="journey-mandate-diagram"
                role="group"
                aria-label="Mandate change from geographic expansion to acquisition integration"
              >
                <div>
                  <Evidence kind="historical">Earlier approved brief</Evidence>
                  <h3>Expand the footprint.</h3>
                  <p>Geographic expansion and capacity for growth.</p>
                </div>
                <RiArrowRightLine aria-hidden="true" />
                <div>
                  <Evidence>Current priority</Evidence>
                  <h3>Bring the business together.</h3>
                  <p>Integrate two acquisitions into one operating model.</p>
                </div>
                <p className="journey-constraint">
                  12 locations · 2 acquisitions · Start within 60 days
                </p>
              </div>
            </div>
            <div className="journey-scope">
              <h3>The original scope</h3>
              <p>
                One responsive homepage and roughly 3–5 key consultant screens
                or states. Fictional data and simulated preview/version
                interactions were permitted. A production backend, live AI,
                authentication, and real board delivery were outside that
                requirement.
              </p>
            </div>
          </Chapter>

          <Chapter
            id="reasoning"
            number="02"
            label="Problem framing"
            title="The useful answer wasn’t a score."
            intro="Each fictional candidate offers something relevant and leaves something unresolved. A single ranking would conceal the discussion the client needs to have."
          >
            <div className="journey-candidate-grid">
              {candidates.map((candidate, index) => (
                <article key={candidate.id} className="journey-evidence-card">
                  <div className="journey-person">
                    <img
                      src={
                        [
                          "/avatars/claire-bennett.jpeg",
                          "/avatars/marcus-reed.png",
                          "/avatars/daniel-foster.jpeg",
                        ][index]
                      }
                      alt=""
                      width="48"
                      height="48"
                    />
                    <div>
                      <span>Profile {candidate.id}</span>
                      <h3>{candidate.name}</h3>
                    </div>
                  </div>
                  <p className="journey-availability">
                    {candidate.availabilityDays}-day availability
                    <span>
                      {candidate.availabilityDays <= 60
                        ? "Within the 60-day target"
                        : "Beyond the 60-day target"}
                    </span>
                  </p>
                  <dl>
                    <div>
                      <dt>Supplied information</dt>
                      <dd>{candidate.statement}</dd>
                    </div>
                    <div>
                      <dt>
                        {candidate.id === "C"
                          ? "Unverified / not supplied"
                          : "Still to establish"}
                      </dt>
                      <dd>{candidate.limitation}</dd>
                    </div>
                  </dl>
                  <div className="journey-followup">
                    <h4>The next question</h4>
                    <p>{questions[index]}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="journey-two-notes">
              <div>
                <h3>For the prospective client</h3>
                <p>
                  “Can this firm understand my business and explain its
                  approach?”
                </p>
              </div>
              <div>
                <h3>For the consultant</h3>
                <p>“What changed, what do we know, and what needs review?”</p>
              </div>
            </div>
            <p className="journey-note">
              Source: the prototype’s candidate records. “Match” describes one
              requirement, never an entire person. Portraits and extended
              profile context are synthetic, not independent evidence.
            </p>
          </Chapter>

          <Chapter
            id="journey"
            number="03"
            label="Journey and hierarchy"
            title="One question at a time. One connected workspace."
            intro="The dashboard announces the change. The brief establishes the context. Evidence shapes the discussion, and review closes the loop."
          >
            <ol className="journey-flow" aria-label="Consultant journey">
              {journey.map(([file, title, description], index) => (
                <li key={title}>
                  <a
                    href={`${base}${file}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open capture: ${title}`}
                  >
                    <img
                      src={`${base}${file}`}
                      alt=""
                      width={captureSizes[file][0]}
                      height={captureSizes[file][1]}
                      loading="lazy"
                    />
                  </a>
                  <span className="journey-flow-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </li>
              ))}
            </ol>
            <div className="journey-meeting">
              <div>
                <Evidence kind="intent">Information priority</Evidence>
                <h3>What opens the client meeting</h3>
                <ol>
                  <li>
                    Restate the integration priority, 12-location scope and
                    60-day target.
                  </li>
                  <li>
                    Explain the difference from the earlier approved brief.
                  </li>
                  <li>
                    Compare supported evidence, open questions and the current
                    review state.
                  </li>
                </ol>
              </div>
              <div>
                <h3>What stays out of the opening</h3>
                <p>
                  Full profile dumps, generic dashboard metrics, AI
                  implementation details, low-priority fields, composite fit
                  scores and a premature winner. Keep supporting detail
                  available without making it the opening argument.
                </p>
              </div>
            </div>
            <p className="journey-note">
              Implemented flow, locally captured. The sample opens the actual
              application full-screen and is self-directed; there is no separate
              guided slideshow.
            </p>
          </Chapter>

          <Chapter
            id="experience"
            number="04"
            label="Final interaction"
            title="Give every interaction a reason to exist."
            intro="The interface keeps the source material, its interpretation, and the next action close together. Three decisions carry the experience."
          >
            <div className="journey-product-row">
              <div>
                <span className="journey-small-number">01</span>
                <h3>Read the story. Scan the requirements.</h3>
                <p>
                  The client document sits beside a structured breakdown.
                  Current and original briefs remain accessible. Editing or
                  restoring Search, Role or Company details explicitly requires
                  fresh review.
                </p>
                <details className="journey-details">
                  <summary>See the brief and editing evidence</summary>
                  <Capture
                    file="client-brief-versions.jpg"
                    alt="Client brief versions dialog showing current and past documents"
                    caption="Current and original client documents remain separate."
                  />
                  <Capture
                    file="edit-requirements.jpg"
                    alt="Edit search dialog explaining that saving or restoring requires fresh review"
                    caption="The consequence is explained before saving."
                  />
                  <Capture
                    file="fresh-review-required.jpg"
                    alt="Assignment overview after a search detail edit displaying Fresh review required"
                    caption="A real edit produces the fresh-review state."
                  />
                </details>
              </div>
              <Capture
                file="assignment-desktop.jpg"
                alt="Desktop assignment showing the full client document beside Brief breakdown"
                caption="The long-form brief supplies context; the structured view makes changed priorities scannable."
              />
            </div>
            <div className="journey-product-row journey-product-reverse">
              <div>
                <span className="journey-small-number">02</span>
                <h3>Compare claims without hiding uncertainty.</h3>
                <p>
                  Shared criteria make differences inspectable. Profiles retain
                  context, source actions expose supporting information, and
                  add/remove controls change the working selection.
                </p>
                <details className="journey-details">
                  <summary>See the profile and selection evidence</summary>
                  <Capture
                    file="candidate-profile.jpg"
                    alt="Marcus Reed full profile dialog above the actual candidates page"
                    caption="A contextual profile view uses the same sample candidate record."
                  />
                  <Capture
                    file="add-candidate.jpg"
                    alt="Add candidates dialog with Claire available to add back into the selection"
                    caption="Captured after removing Claire; re-adding restores the working selection."
                  />
                </details>
              </div>
              <Capture
                file="comparison-desktop.jpg"
                alt="Actual comparison table with Claire, Marcus and Daniel and Match, To confirm, Not provided and Not met labels"
                caption="Evidence states use words as well as color. Daniel’s 90 days remains outside the 60-day target."
              />
            </div>
            <div className="journey-product-row">
              <div>
                <span className="journey-small-number">03</span>
                <h3>Prepare a document people can question.</h3>
                <p>
                  The AI-assisted sample draft brings the mandate, trade-offs
                  and follow-up questions together. The consultant edits, saves
                  versions and explicitly confirms review submission.
                </p>
                <Evidence kind="simulated">Local simulation</Evidence>
                <p className="journey-note">
                  The draft is assembled from local sample data. There is no
                  live AI call or real review delivery.
                </p>
                <details className="journey-details">
                  <summary>See document history and review evidence</summary>
                  <Capture
                    file="discussion-history.jpg"
                    alt="Discussion brief history showing Version 1 marked Earlier approved"
                    caption="Earlier approval stays attached to the historical version."
                  />
                  <Capture
                    file="review-confirmation.jpg"
                    alt="Send for review confirmation explaining that further changes require a new draft"
                    caption="Explicit confirmation precedes the local completion state."
                  />
                </details>
              </div>
              <Capture
                file="discussion-editor-desktop.jpg"
                alt="Actual discussion brief editor with formatting tools and human review notice"
                caption="An editable working artifact, not a fixed recommendation or an AI-selected winner."
              />
            </div>
          </Chapter>

          <Chapter
            id="website"
            number="05"
            label="The changed design decision"
            title="Sell the approach. Give the demo its own place."
            intro="The first homepage led quickly into the sample assignment. Feedback exposed the gap: a prospective client needed to understand Mandate’s broader value before exploring a fictional scenario."
          >
            <div className="journey-architecture">
              <div>
                <Evidence kind="historical">
                  Earlier architecture · 524e818
                </Evidence>
                <h3>Lead with the scenario</h3>
                <ol>
                  <li>Hero</li>
                  <li>Embedded sample workspace</li>
                  <li>Scenario-led explanation</li>
                </ol>
              </div>
              <RiArrowRightLine aria-hidden="true" />
              <div>
                <Evidence>Final working tree</Evidence>
                <h3>Lead with the business value</h3>
                <ol>
                  <li>Leadership challenges</li>
                  <li>Product value and approach</li>
                  <li>Technology and judgment</li>
                  <li>One dedicated interactive demo</li>
                  <li>Questions and conversation</li>
                </ol>
              </div>
            </div>
            <p className="journey-note">
              Architecture diagram based on historical and current page code,
              not a reconstructed screenshot.
            </p>
            <div className="journey-before-after">
              <Capture
                file="home-before-524e818.png"
                alt="Genuine earlier Mandate hero capture extracted from commit 524e818"
                caption="Historical hero artifact committed November 13, 2026 in 524e818. This is the original capture, not a rendering of today’s code."
              />
              <Capture
                file="website-desktop.jpg"
                alt="Final Mandate hero with broader leadership proposition and streamlined navigation"
                caption="Final local website capture, November 14, 2026. The cinematic visual direction remains; the proposition and page architecture evolve."
              />
            </div>
            <div className="journey-website-reason">
              <div>
                <h3>Clarity through change</h3>
                <p>
                  Growth, acquisitions and critical transitions establish the
                  service. Authentic interface illustrations show how the
                  workspace supports it. A single demo section then invites
                  hands-on exploration.
                </p>
              </div>
            </div>
            <Capture
              file="website-challenges.jpg"
              alt="Final leadership challenges section using an animated chart, priority history and candidate transition over architectural imagery"
              caption="Final marketing cards frame broader leadership challenges with recognizable product-derived visuals."
            />
          </Chapter>

          <Chapter
            id="decisions"
            number="06"
            label="Iteration and trade-offs"
            title="Keep the reasoning. Leave out false certainty."
            intro="Short, focused design-and-code iterations preserved the working application while changing the way the website explains its value."
          >
            <div className="journey-decision-list">
              <article>
                <span>Instead of a definitive score</span>
                <h3>Evidence, trade-offs and next questions.</h3>
                <p>
                  The profiles deliberately leave different gaps. No single
                  winner is required.
                </p>
              </article>
              <article>
                <span>Instead of approval by inheritance</span>
                <h3>A new draft earns a fresh review.</h3>
                <p>
                  Version identity survives editing and restoration; historical
                  approval is not current approval.
                </p>
              </article>
              <article>
                <span>Instead of a separate linear demo</span>
                <h3>Enter the real workspace.</h3>
                <p>
                  The preview expands into the existing application route. Entry
                  from the website or project hub starts a fresh sample;
                  navigation within the workspace retains progress.
                </p>
              </article>
              <article>
                <span>Instead of unnecessary infrastructure</span>
                <h3>Be explicit about the simulation.</h3>
                <p>
                  Local drafting, versioning and review state demonstrate the
                  interaction without pretending to deliver a production
                  service.
                </p>
              </article>
            </div>
            <div className="journey-safeguard">
              <div>
                <Evidence>Source + UI verified</Evidence>
                <h3>Historical approval stays historical.</h3>
                <p>
                  V1 remains “Earlier approved.” Restoring it creates a new
                  draft with the outdated expansion opening. Review stays
                  blocked until it is aligned with the current integration
                  mandate.
                </p>
                <p>
                  Assignment-detail edits have a separate revision check. A
                  changed brief cannot silently reuse a prior review state.
                </p>
              </div>
              <Capture
                file="restored-draft-blocked.jpg"
                alt="Restored expansion discussion draft showing an outdated mandate warning and disabled Send for review action"
                caption="Actual restored state: an earlier approval badge cannot make this the current recommendation."
              />
            </div>
            <details className="journey-details">
              <summary>Repository-backed chronology and tool roles</summary>
              <ul className="journey-chronology">
                <li>
                  <time dateTime="2026-11-07">November 7</time>
                  <span>
                    <code>7574f74</code> — initial repository commit. Earlier
                    conversation dates are reported, not proven by this commit.
                  </span>
                </li>
                <li>
                  <time dateTime="2026-11-13">November 13</time>
                  <span>
                    <code>524e818</code> — homepage foundation;{" "}
                    <code>f7ced5f</code> — product value; <code>3756b06</code> —
                    approach; <code>68e71bc</code> — technology;{" "}
                    <code>25f07f1</code> — historical guided demo;{" "}
                    <code>dd6a662</code> — homepage completion.
                  </span>
                </li>
                <li>
                  <time dateTime="2026-11-14">November 14</time>
                  <span>
                    Current working tree: self-directed demo and further visual
                    refinements. These are captured implementation changes, not
                    new commits attributed to prior RUN prompts.
                  </span>
                </li>
              </ul>
              <p>
                The designer supplied the brief, assets and decisions. ChatGPT
                supported framing, copy and critique; Codex implemented scoped
                changes in React/TypeScript/Vite. The supplied Loom narrative is
                a designer-reported walkthrough, not an independent consultant
                study. No model version or human time savings are inferred.
              </p>
            </details>
          </Chapter>

          <Chapter
            id="production"
            number="07"
            label="Production process"
            title="From a conversation to a working prototype."
            intro="I used ChatGPT to plan the experience and Codex CLI to design and prototype it in the browser, keeping the creative direction and final decisions in my hands."
          >
            <div className="journey-two-notes">
              <div>
                <h3>Plan with ChatGPT</h3>
                <p>
                  I used ChatGPT to unpack the challenge, organize the
                  consultant journey and shape the homepage story. It helped me
                  question the information hierarchy, develop the copy and turn
                  broad ideas into focused implementation briefs.
                </p>
                <p>
                  The important shift was strategic: explain Mandate’s wider
                  advisory value first, then give the fictional assignment one
                  dedicated place to explore.
                </p>
              </div>
              <div>
                <h3>Design and prototype with Codex CLI</h3>
                <p>
                  I brought those briefs into the existing repository through
                  Codex CLI. From there, I directed the layouts, components and
                  interactions through small rounds of implementation, browser
                  review and refinement across desktop and mobile.
                </p>
                <p>
                  The working interface became the design artifact. I refined
                  spacing, typography, motion and workflow behavior in context,
                  while preserving the connected assignment, candidate and
                  document states.
                </p>
              </div>
            </div>
            <div className="journey-checks">
              <table>
                <caption>Why this frontend stack fit the challenge</caption>
                <thead>
                  <tr>
                    <th scope="col">Foundation</th>
                    <th scope="col">Why we kept it</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">React + TypeScript</th>
                    <td>
                      Reusable components keep the website previews and
                      application consistent. Typed models make candidate
                      evidence, brief revisions and review states explicit as
                      the prototype evolves.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Vite</th>
                    <td>
                      A lightweight development and build setup supports short
                      design-and-code iterations. It fits a browser-based
                      prototype without adding server infrastructure the
                      challenge does not require.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">React Router</th>
                    <td>
                      The website, process document and full-screen workspace
                      share one application, with direct routes and clear return
                      paths.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Tailwind CSS + scoped CSS</th>
                    <td>
                      Shared styling foundations support consistency; page- and
                      component-scoped CSS provides precise control over
                      editorial layouts, responsive behavior and motion.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Base UI + shared components</th>
                    <td>
                      Existing dialog, input and button foundations support
                      consistent interactions and accessibility work, leaving
                      more attention for the search experience itself.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="journey-scope">
              <h3>Build on what works. Check what changes.</h3>
              <div>
                <p>
                  The stack was already present in the prototype. We retained it
                  rather than introduce a framework migration, and used
                  TypeScript, lint, unit checks and Playwright browser checks to
                  support the iterations. These checks complement visual review;
                  they do not replace an independent consultant study.
                </p>
                <p>
                  ChatGPT and Codex were production tools for creating the
                  experience. The AI-assisted drafting shown inside the product
                  remains a local simulation, with no live AI service, backend
                  or real review submission.
                </p>
              </div>
            </div>
          </Chapter>

          <Chapter
            id="validation"
            number="08"
            label="Usability and accessibility"
            title="Responsive is a behavior, not just a smaller screen."
            intro="Desktop keeps source material and structured information adjacent. Mobile gives the current step a clear place, opens documents for reading and keeps the main action reachable."
          >
            <div className="journey-responsive-pair">
              <Capture
                file="assignment-desktop.jpg"
                alt="Desktop overview with sidebar context, step navigation, brief and breakdown"
                caption="Desktop capture · 1440 × 1000 CSS pixels."
              />
              <Capture
                file="assignment-mobile.jpg"
                alt="Mobile overview with dark assignment summary, one current step and the document preview"
                caption="Mobile capture · 390 × 844 CSS pixels."
                className="journey-phone"
              />
            </div>
            <div className="journey-split journey-validation-copy">
              <div>
                <h3>What was checked locally</h3>
                <p>
                  Source inspection and isolated Chromium interaction confirm
                  the candidate facts, version safeguards, add/remove selection,
                  document save, local review completion and return paths shown
                  in these captures.
                </p>
                <p>
                  Automated checks cover the process page’s headings, links,
                  keyboard focus, image loading, overflow and sampled
                  accessibility rules. Detailed commands and actual outcomes are
                  recorded with the evidence.
                </p>
                <a className="journey-text-link" href="#process-evidence">
                  Read the verification record
                  <RiArrowRightLine aria-hidden="true" />
                </a>
              </div>
              <div>
                <h3>What those checks cannot establish</h3>
                <p>
                  Chromium emulation and axe do not prove full WCAG conformance,
                  physical-device behavior, screen-reader usability or
                  consultant understanding. No independent interviews or
                  measured user outcomes are claimed.
                </p>
                <Evidence kind="historical">User-reported</Evidence>
                <p>
                  The supplied source reports the designer finalized mobile and
                  desktop. That report is separate from the fresh local checks
                  for this page.
                </p>
              </div>
            </div>
            <div className="journey-checks">
              <table>
                <caption>Evidence recorded for this process journey</caption>
                <thead>
                  <tr>
                    <th scope="col">Check</th>
                    <th scope="col">Evidence</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Responsive process page</th>
                    <td>
                      Chromium at 320, 390, 1024 and 1440px; screenshot loading
                      and page overflow checks.
                    </td>
                    <td>Locally checked</td>
                  </tr>
                  <tr>
                    <th scope="row">Version and review safety</th>
                    <td>
                      Source inspection plus an actual restored draft with
                      review blocked.
                    </td>
                    <td>Verified locally</td>
                  </tr>
                  <tr>
                    <th scope="row">Consultant workflow</th>
                    <td>
                      Fresh desktop/mobile captures and visible-UI interactions
                      in isolated browser sessions.
                    </td>
                    <td>Exercised locally</td>
                  </tr>
                  <tr>
                    <th scope="row">Independent consultant understanding</th>
                    <td>The proposed comprehension study below.</td>
                    <td>Not conducted</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <details className="journey-details">
              <summary>See the mobile comparison and editor</summary>
              <div className="journey-mobile-evidence">
                <Capture
                  file="comparison-mobile.jpg"
                  alt="Actual mobile candidate comparison retaining native horizontal table navigation"
                  caption="The application comparison retains all candidates and native horizontal scrolling; the marketing excerpt is simplified separately."
                />
                <Capture
                  file="discussion-editor-mobile.jpg"
                  alt="Mobile discussion editor with dark top bar, grouped formatting controls and persistent Save changes action"
                  caption="Saving returns to the assignment view. This is a captured local interaction, not real document delivery."
                />
              </div>
            </details>
          </Chapter>

          <Chapter
            id="reflection"
            number="09"
            label="Outcome and next steps"
            title="A working journey. The important uncertainty left intact."
            intro="The website explains the advisory value. The workspace demonstrates how a consultant can turn a changed mandate into a discussion prepared for review."
          >
            <div className="journey-outcome">
              <Capture
                file="completed-dashboard.jpg"
                alt="Homepage after submission showing Assignment sent for review and the active Northline assignment removed"
                caption="Actual local completion: the active task is replaced by a waiting-for-review summary."
              />
              <div>
                <Evidence kind="simulated">Prototype boundary</Evidence>
                <h3>Prepared for review does not mean approved.</h3>
                <p>
                  The interface simulates manager review for the
                  board-discussion scenario. It sends no document or message.
                  Drafting, search, storage and version history run locally;
                  sign-in and contact are presentation previews.
                </p>
                <p>
                  No placements, client relationships, revenue results or speed
                  gains are presented as real outcomes.
                </p>
                <Link to="/workspace" className="journey-button">
                  <RiPlayFill aria-hidden="true" />
                  Explore the workspace
                </Link>
                <Link to="/" className="journey-text-link">
                  Return to the website
                  <RiArrowRightLine aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="journey-study">
              <div>
                <Evidence kind="proposed">
                  Proposed study · not conducted
                </Evidence>
                <h3>Can another consultant explain the decision?</h3>
                <p>
                  Give five independent consultants the sample without coaching.
                  Ask them to identify the changed priority and timing, explain
                  the supported and unknown evidence for A/B/C, and outline the
                  discussion while locating its review state.
                </p>
                <p>
                  Record task completion, time and misunderstandings. Test
                  narrow-screen comparison, status language and historical
                  restoration next.
                </p>
              </div>
              <div className="journey-study-target">
                <span>Proposed success criterion</span>
                <p>
                  At least <strong>4 of 5</strong> can explain the revised
                  mandate, evidence limits and a justified next question without
                  facilitator guidance.
                </p>
                <small>
                  A target for a future study. No participant results have been
                  measured.
                </small>
              </div>
            </div>
            <details
              className="journey-details journey-source-note"
              id="process-evidence"
            >
              <summary>Sources, truth labels and verification record</summary>
              <div className="journey-evidence-notes">
                <p>
                  <strong>Source draft:</strong> “Mandate Studio — Process
                  Journey Source of Truth,” prepared November 14, 2026. Audited
                  against current code, chronological git history and fresh
                  local browser captures. Conversation and Loom statements
                  remain reported where not independently confirmed.
                </p>
                <p>
                  <strong>Implemented / verified:</strong> locally inspected
                  code or directly exercised behavior.{" "}
                  <strong>Historical:</strong> a named archived artifact or
                  commit. <strong>Design goal:</strong> a reason for a choice,
                  not a measured result. <strong>Simulated:</strong> local
                  prototype behavior. <strong>Proposed:</strong> future
                  research, never a completed test.
                </p>
                <p>
                  <strong>Source revision:</strong> HEAD <code>dd6a662</code>{" "}
                  plus the existing uncommitted working tree, captured November
                  14, 2026. Screenshots are not claimed to be a clean rendering
                  of that commit. The historical hero is extracted from{" "}
                  <code>524e818</code>; the architecture diagram is an
                  interpretation of the two source structures.
                </p>
                <p>
                  <strong>Actual local QA:</strong> build, lint, unit/domain
                  checks, process route checks and original application/demo
                  regressions are run for this delivery. Exact commands, counts,
                  dates, failures and limitations are in the{" "}
                  <a href="/process/journey/verification.md">
                    verification report
                  </a>
                  ; the{" "}
                  <a href="/process/journey/capture-manifest.json">
                    capture manifest
                  </a>{" "}
                  records source, browser and image hashes. A passing automated
                  scan is not accessibility certification.
                </p>
                <p>
                  <strong>Primary code evidence:</strong>{" "}
                  <code>src/domain/model.ts</code>,{" "}
                  <code>assignment-details.ts</code>,{" "}
                  <code>assignment-flow.ts</code>,{" "}
                  <code>src/state/WorkspaceV2Provider.tsx</code>,{" "}
                  <code>src/features/Discussion.tsx</code>, and{" "}
                  <code>src/components/workspace/WorkspaceDemo.tsx</code>.
                </p>
                <p>
                  Physical-device, Safari/Firefox and dedicated screen-reader
                  studies remain unverified in this run. Independent consultant
                  comprehension is proposed. No public deployment or challenge
                  submission was performed.
                </p>
              </div>
            </details>
          </Chapter>
        </main>
      </div>
      <footer className="journey-footer">
        <div className="journey-container">
          <Link to="/" aria-label="Mandate homepage">
            <img
              src="/brand/mandate.svg"
              alt="Mandate"
              width="141"
              height="26"
            />
          </Link>
          <p>
            A fictional prototype for FutureProofing.
            <br />A design process, not a claim of commercial results.
          </p>
          <a href="#process-top">
            Back to top
            <RiArrowUpLine aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  )
}
