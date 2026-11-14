import { useEffect, type RefObject } from "react"

/** Reveal editorial groups once, without replacing their product interactions. */
export function useHomepageReveals(header: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = header.current?.closest(".mandate-home")
    if (!root) return
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const active = new Map<HTMLElement, Animation>()
    let observer: IntersectionObserver | undefined
    let targets: HTMLElement[] = []
    const clear = () => {
      observer?.disconnect()
      active.forEach((animation) => animation.cancel())
      active.clear()
      targets.forEach((element) => {
        delete element.dataset.homeReveal
        delete element.dataset.homeVisible
      })
    }
    const setup = () => {
      clear()
      if (preference.matches) return
      targets = Array.from(
        root.querySelectorAll<HTMLElement>(
          [
            ".homepage-section .homepage-heading",
            ".homepage-section .homepage-copy",
            ".approach-timeline > li > h3",
            ".approach-timeline > li > p",
            ".homepage-faq-contact > p",
            ".homepage-footer-meta > p",
          ].join(",")
        )
      )
      const delays = new Map<HTMLElement, number>()
      for (const section of root.querySelectorAll("main > section,footer")) {
        const group = targets.filter((element) => section.contains(element))
        group.forEach((element, index) => {
          element.dataset.homeReveal = "true"
          delays.set(element, Math.min(index, 3) * 80)
        })
      }
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const element = entry.target as HTMLElement
            element.dataset.homeVisible = "true"
            observer?.unobserve(element)
            const animation = element.animate(
              [{ opacity: 0 }, { opacity: 1 }],
              {
                duration: 480,
                delay: delays.get(element) || 0,
                easing: "cubic-bezier(0.23, 1, 0.32, 1)",
                fill: "both",
              }
            )
            active.set(element, animation)
            void animation.finished
              .then(() => {
                animation.cancel()
                active.delete(element)
              })
              .catch(() => {})
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
      )
      targets.forEach((element) => observer!.observe(element))
    }
    const focus = (event: Event) => {
      for (const element of targets)
        if (element.contains(event.target as Node)) {
          active.get(element)?.cancel()
          active.delete(element)
          element.dataset.homeVisible = "true"
          observer?.unobserve(element)
        }
    }
    setup()
    root.addEventListener("focusin", focus)
    preference.addEventListener("change", setup)
    return () => {
      clear()
      root.removeEventListener("focusin", focus)
      preference.removeEventListener("change", setup)
    }
  }, [header])
}
