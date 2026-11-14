import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"

interface Step {
  label: string
  to: string
  available: boolean
}
export function MobileAssignmentPager({
  steps,
  pages,
  navRef,
  stuck,
}: {
  steps: Step[]
  pages: ReactNode[]
  navRef: RefObject<HTMLElement | null>
  stuck: boolean
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const current = Math.max(
    0,
    steps.findIndex((step) => step.to === location.pathname)
  )
  const track = useRef<HTMLDivElement>(null)
  const panels = useRef<(HTMLDivElement | null)[]>([])
  const settling = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gesture = useRef<{ x: number; y: number; scroll: number } | null>(null)
  const [height, setHeight] = useState<number>()
  const currentRef = useRef(current)
  useLayoutEffect(() => {
    if (currentRef.current !== current) {
      currentRef.current = current
      navRef.current
        ?.querySelector<HTMLElement>(".mobile-assignment-current-step")
        ?.focus({ preventScroll: true })
    }
  }, [current, navRef])
  function go(index: number) {
    if (!steps[index]?.available || index === currentRef.current) return
    navigate(steps[index].to)
    // A dirty-document navigation guard can reject the move; return to its page.
    requestAnimationFrame(() => {
      if (window.location.pathname !== steps[index].to && track.current)
        track.current.scrollTo({
          left: currentRef.current * track.current.clientWidth,
          behavior: "instant",
        })
    })
  }
  useLayoutEffect(() => {
    const pane = panels.current[current]
    const scroller = track.current
    if (!pane || !scroller) return
    if (settling.current) clearTimeout(settling.current)
    let width = scroller.clientWidth
    scroller.scrollTo({ left: current * width, behavior: "instant" })
    const update = () => {
      setHeight(pane.getBoundingClientRect().height)
      if (width !== scroller.clientWidth) {
        width = scroller.clientWidth
        scroller.scrollTo({ left: current * width, behavior: "instant" })
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(pane)
    observer.observe(scroller)
    return () => {
      observer.disconnect()
      if (settling.current) clearTimeout(settling.current)
    }
  }, [current, steps.length])
  function settle() {
    if (gesture.current) return
    if (settling.current) clearTimeout(settling.current)
    settling.current = setTimeout(() => {
      const el = track.current
      if (el) go(Math.round(el.scrollLeft / el.clientWidth))
    }, 150)
  }
  function moveTo(index: number) {
    if (!steps[index]?.available) return
    const el = track.current
    if (el)
      el.scrollTo({
        left: index * el.clientWidth,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      })
  }
  return (
    <>
      <nav
        ref={navRef}
        className={`assignment-steps mobile-assignment-pager-nav ${stuck ? "is-stuck" : ""}`}
        aria-label="Assignment steps"
        onTouchStart={(event) => {
          if (settling.current) clearTimeout(settling.current)
          if (track.current) track.current.style.scrollSnapType = "none"
          const touch = event.touches[0]
          gesture.current = {
            x: touch.clientX,
            y: touch.clientY,
            scroll: track.current?.scrollLeft ?? 0,
          }
        }}
        onTouchMove={(event) => {
          const start = gesture.current
          const touch = event.touches[0]
          if (!start || !track.current) return
          const dx = start.x - touch.clientX
          if (Math.abs(dx) > Math.abs(start.y - touch.clientY))
            track.current.scrollLeft = start.scroll + dx
        }}
        onTouchEnd={() => {
          const el = track.current
          const start = gesture.current
          gesture.current = null
          if (el && start) {
            const delta = el.scrollLeft - start.scroll
            el.style.scrollSnapType = ""
            moveTo(
              Math.abs(delta) > el.clientWidth * 0.15
                ? current + Math.sign(delta)
                : current
            )
          }
          settle()
        }}
        onTouchCancel={() => {
          gesture.current = null
          if (track.current) track.current.style.scrollSnapType = ""
          moveTo(current)
        }}
      >
        <button
          type="button"
          aria-label={`Previous step${steps[current - 1] ? `: ${steps[current - 1].label}` : ""}`}
          disabled={!steps[current - 1]?.available}
          onClick={() => moveTo(current - 1)}
        >
          <RiArrowLeftSLine aria-hidden="true" />
        </button>
        <div
          className="mobile-assignment-current-step"
          tabIndex={-1}
          aria-live="polite"
          aria-current="step"
        >
          <h2>{steps[current].label}</h2>
          <small>
            Step {current + 1} of {steps.length}
          </small>
        </div>
        <button
          type="button"
          aria-label={`Next step${steps[current + 1] ? `: ${steps[current + 1].label}` : ""}`}
          disabled={!steps[current + 1]?.available}
          onClick={() => moveTo(current + 1)}
        >
          <RiArrowRightSLine aria-hidden="true" />
        </button>
      </nav>
      <div
        ref={track}
        className="mobile-assignment-page-track"
        style={{ height }}
        onScroll={settle}
        onTouchStart={(event) => {
          if (settling.current) clearTimeout(settling.current)
          const touch = event.touches[0]
          gesture.current = {
            x: touch.clientX,
            y: touch.clientY,
            scroll: track.current?.scrollLeft ?? 0,
          }
        }}
        onTouchEnd={() => {
          gesture.current = null
          settle()
        }}
        onTouchCancel={() => {
          gesture.current = null
          settle()
        }}
      >
        {steps
          .filter((step) => step.available)
          .map((step) => {
            const index = steps.indexOf(step)
            return (
              <div
                ref={(node) => {
                  panels.current[index] = node
                }}
                key={step.to}
                className={`mobile-assignment-page ${index === 0 ? "assignment-layout--mobile-overview" : ""}`}
                inert={index !== current}
                aria-hidden={index !== current || undefined}
              >
                {pages[index]}
              </div>
            )
          })}
      </div>
    </>
  )
}
