import { useEffect, type RefObject } from "react"

/** Keep the feature sequence scroll-driven; never pin a card taller than the viewport. */
export function useProductCardStack(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const cards = [
      ...root.querySelectorAll<HTMLElement>(":scope > .product-feature"),
    ]
    const desktop = window.matchMedia("(min-width:1101px)")
    const motion = window.matchMedia("(prefers-reduced-motion:reduce)")
    let frame = 0
    const clear = () => {
      delete root.dataset.stacked
      cards.forEach((card) => {
        card.style.removeProperty("transform")
        card.style.removeProperty("opacity")
        card.style.removeProperty("filter")
      })
    }
    const update = () => {
      frame = 0
      if (
        !desktop.matches ||
        motion.matches ||
        cards.some((card) => card.offsetHeight > window.innerHeight - 144)
      ) {
        clear()
        return
      }
      root.dataset.stacked = "true"
      // Read all geometry before applying transforms; scrolling never changes React state.
      const bounds = cards.map((card) => card.getBoundingClientRect())
      cards.forEach((card, index) => {
        const next = bounds[index + 1]
        if (!next) {
          card.style.removeProperty("transform")
          card.style.removeProperty("opacity")
          card.style.removeProperty("filter")
          return
        }
        const progress = Math.max(
          0,
          Math.min(
            1,
            (bounds[index].height + 88 + index * 16 - next.top) /
              bounds[index].height
          )
        )
        card.style.transform = `scale(${1 - progress * 0.035})`
        card.style.opacity = String(1 - progress)
        card.style.filter = `blur(${Math.max(0, (progress - 0.5) * 2) * 8}px)`
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    // Keyboard users return to the real position of a covered card before using its tabs.
    const focus = (event: FocusEvent) => {
      if (!root.dataset.stacked) return
      const index = cards.findIndex((card) =>
        card.contains(event.target as Node)
      )
      if (index < 0) return
      const gap = parseFloat(getComputedStyle(root).rowGap) || 0
      const naturalTop =
        root.getBoundingClientRect().top +
        window.scrollY +
        cards
          .slice(0, index)
          .reduce((total, card) => total + card.offsetHeight + gap, 0)
      if (window.scrollY > naturalTop - 88 + 2)
        window.scrollTo({ top: naturalTop - 88, behavior: "instant" })
    }
    const observer = new ResizeObserver(schedule)
    cards.forEach((card) => observer.observe(card))
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    desktop.addEventListener("change", schedule)
    motion.addEventListener("change", schedule)
    root.addEventListener("focusin", focus)
    update()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      desktop.removeEventListener("change", schedule)
      motion.removeEventListener("change", schedule)
      root.removeEventListener("focusin", focus)
      clear()
    }
  }, [ref])
}
