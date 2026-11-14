import { useEffect, useLayoutEffect, useRef } from "react"
import { RiCloseLine, RiErrorWarningLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"

const duration = 10_000

export function AssignmentUpdateToast({
  onDismiss,
  onExpire,
}: {
  onDismiss: () => void
  onExpire: () => void
}) {
  const toast = useRef<HTMLElement>(null)
  const border = useRef<SVGSVGElement>(null)
  const progress = useRef<SVGRectElement>(null)
  const expire = useRef(onExpire)
  useLayoutEffect(() => {
    expire.current = onExpire
  }, [onExpire])
  useLayoutEffect(() => {
    const element = toast.current,
      svg = border.current,
      rect = progress.current
    if (!element || !svg || !rect) return
    const resize = () => {
      const width = element.clientWidth + 2,
        height = element.clientHeight + 2
      const radius = Math.min(
        parseFloat(getComputedStyle(element).borderTopLeftRadius),
        height / 2
      )
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`)
      rect.setAttribute("width", String(width - 2))
      rect.setAttribute("height", String(height - 2))
      rect.setAttribute("rx", String(Math.max(0, radius - 1)))
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const element = toast.current,
      rect = progress.current
    if (!element || !rect || typeof rect.animate !== "function") return
    const motion = matchMedia("(prefers-reduced-motion: reduce)")
    // The normalized SVG path makes the whole responsive perimeter the timer.
    const countdown = rect.animate(
      [{ strokeDashoffset: 0 }, { strokeDashoffset: 100 }],
      {
        duration,
        easing: motion.matches ? "steps(10, end)" : "linear",
        fill: "forwards",
      }
    )
    let hovered = false
    let disposed = false
    const sync = () => {
      if (disposed) return
      if (
        hovered ||
        element.contains(document.activeElement) ||
        document.hidden
      )
        countdown.pause()
      else countdown.play()
    }
    const enter = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        hovered = true
        sync()
      }
    }
    const leave = () => {
      hovered = false
      sync()
    }
    const blur = () => queueMicrotask(sync)
    const changeMotion = () =>
      countdown.effect?.updateTiming({
        easing: motion.matches ? "steps(10, end)" : "linear",
      })
    element.addEventListener("pointerenter", enter)
    element.addEventListener("pointerleave", leave)
    element.addEventListener("focusin", sync)
    element.addEventListener("focusout", blur)
    document.addEventListener("visibilitychange", sync)
    motion.addEventListener("change", changeMotion)
    sync()
    void countdown.finished.then(
      () => {
        if (!disposed) expire.current()
      },
      () => {}
    )
    return () => {
      disposed = true
      element.removeEventListener("pointerenter", enter)
      element.removeEventListener("pointerleave", leave)
      element.removeEventListener("focusin", sync)
      element.removeEventListener("focusout", blur)
      document.removeEventListener("visibilitychange", sync)
      motion.removeEventListener("change", changeMotion)
      countdown.cancel()
    }
  }, [])
  return (
    <section
      ref={toast}
      role="status"
      aria-labelledby="assignment-update-title"
      className="assignment-update-alert"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation()
          onDismiss()
        }
      }}
    >
      <svg
        ref={border}
        className="assignment-toast-countdown"
        aria-hidden="true"
        focusable="false"
      >
        <rect ref={progress} x="1" y="1" pathLength="100" />
      </svg>
      <RiErrorWarningLine
        className="assignment-toast-leading-icon"
        aria-hidden="true"
      />
      <div className="assignment-toast-copy">
        <h2 id="assignment-update-title">The mandate has been updated:</h2>
        <p>
          priority changed from geographic expansion to integrating two
          acquisitions.
        </p>
        <span className="sr-only">
          Dismisses automatically after 10 seconds. Hover or focus to pause.
        </span>
      </div>
      <Button
        className="assignment-toast-close"
        variant="ghost"
        size="icon-sm"
        aria-label="Dismiss mandate update"
        onClick={onDismiss}
      >
        <RiCloseLine aria-hidden="true" />
      </Button>
    </section>
  )
}
