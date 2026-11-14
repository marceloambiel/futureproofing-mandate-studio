import { useEffect, useId, useRef, useState } from "react"
import { RiLinksLine, RiSparklingLine, RiUserLine } from "@remixicon/react"
import "./technology-judgment.css"

export function TechnologyJudgment() {
  const id = useId()
  const root = useRef<HTMLElement>(null)
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const element = root.current
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEntered(true)
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -64px 0px" }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return (
    <section
      ref={root}
      id="technology-judgment"
      data-nav-theme="dark"
      data-entered={entered}
      className="homepage-section technology-judgment"
      aria-labelledby={`${id}-title`}
    >
      <div className="homepage-container tech-layout">
        <header className="tech-intro">
          <h2 id={`${id}-title`} className="homepage-heading">
            <span>Built to support</span> <span>every search</span>{" "}
            <span>decision.</span>
          </h2>
        </header>
        <div className="tech-grid">
          <article className="tech-card">
            <RiLinksLine className="tech-card-icon" aria-hidden="true" />
            <div className="tech-card-copy">
              <h3>Connected workspace</h3>
              <p>
                Keep briefs and evidence <br />
                together. Revisit versions <br />
                and stay aligned as <br />
                business priorities change.
              </p>
            </div>
          </article>
          <article className="tech-card">
            <RiSparklingLine className="tech-card-icon" aria-hidden="true" />
            <div className="tech-card-copy">
              <h3>AI-assisted preparation</h3>
              <p>
                Turn existing information <br />
                into a draft. Review and <br />
                refine it before the next <br />
                leadership discussion.
              </p>
            </div>
          </article>
          <article className="tech-card">
            <RiUserLine className="tech-card-icon" aria-hidden="true" />
            <div className="tech-card-copy">
              <h3>Human judgment</h3>
              <p>
                Review evidence and <br />
                questions. Weigh context <br />
                and trade-offs before <br />
                making a recommendation.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
