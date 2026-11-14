import { SectionActions, type ConversationAction } from "./SectionActions"
import { useEffect, useId, useRef } from "react"
import "./our-approach.css"

const stages = [
  {
    id: "understand",
    title: "Understand",
    description:
      "Define the business context, priorities, and capabilities the organization needs.",
  },
  {
    id: "explore",
    title: "Explore",
    description:
      "Examine candidates and their experience against the current requirements.",
  },
  {
    id: "evaluate",
    title: "Evaluate",
    description:
      "Compare the evidence, understand the trade-offs, and identify remaining questions.",
  },
  {
    id: "advise",
    title: "Advise",
    description: "Prepare a clear discussion that supports the next decision.",
  },
] as const

export function OurApproach({ onRequestConversation }: ConversationAction) {
  const id = useId()
  const timeline = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const list = timeline.current!,
      items = Array.from(list.children) as HTMLElement[]
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0
    const update = () => {
      frame = 0
      const readingLine = window.innerHeight * 0.55
      const bounds = items.map((item) => item.getBoundingClientRect())
      items.forEach((item, index) => {
        item.dataset.reached = String(readingLine >= bounds[index].top + 22)
        if (index === items.length - 1) return
        const start = bounds[index].top + 44,
          end = bounds[index + 1].top
        const progress = Math.max(
          0,
          Math.min(1, (readingLine - start) / Math.max(1, end - start))
        )
        item.style.setProperty(
          "--timeline-progress",
          String(preference.matches ? Number(progress === 1) : progress)
        )
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(list)
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    preference.addEventListener("change", schedule)
    update()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      preference.removeEventListener("change", schedule)
    }
  }, [])
  return (
    <section
      id="our-process"
      data-nav-theme="light"
      className="homepage-section our-approach"
      aria-labelledby={`${id}-title`}
    >
      <div className="homepage-container approach-layout">
        <div className="approach-context">
          <header className="approach-intro">
            <h2 id={`${id}-title`} className="homepage-heading">
              A clearer path <br />
              to leadership.
            </h2>
            <p className="homepage-copy">
              Understand the challenge, explore the evidence, <br />
              and prepare for the next decision.
            </p>
          </header>
          <SectionActions
            onRequestConversation={onRequestConversation}
            primary="Talk through your next search"
            secondary="See the process in action"
          />
        </div>
        <ol
          ref={timeline}
          className="approach-timeline"
          role="list"
          aria-label="Our approach timeline"
        >
          {stages.map((stage, index) => (
            <li key={stage.id}>
              <span className="approach-timeline-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
