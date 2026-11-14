import { useEffect, type RefObject } from "react"
import Lenis from "lenis"
import { useNavigate } from "react-router-dom"
import "lenis/dist/lenis.css"

// Matches marceloambiel.com's Lenis motion settings (inspected 2026-11-14).
// Anchors adapt those settings to React Router and native-scroll interruption.
// Mount only on the marketing page: the workspace owns its native scroll surfaces.
export function useHomepageSmoothScroll(
  header: RefObject<HTMLElement | null>,
  contactOpen: boolean
) {
  const navigate = useNavigate()
  useEffect(() => {
    const root = header.current?.closest(".mandate-home")
    if (!root || contactOpen) return
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.14,
      syncTouch: false,
      anchors: false, // handled below so interrupted native scrolls cannot fight Lenis
      respectReducedMotion: true,
      stopInertiaOnNavigate: true,
      // A horizontal comparison gesture stays native; vertical wheel input must
      // stay with Lenis even when the pointer crosses the table during inertia.
      virtualScroll: ({ deltaX, deltaY }) =>
        Math.abs(deltaY) >= Math.abs(deltaX),
      prevent: (node) =>
        !!node.closest(
          '[data-slot="dialog-content"],[data-signin-popup],.marketing-mobile-navigation-panel,input,textarea,select,[data-lenis-prevent]'
        ),
    })
    const anchor = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const link = (event.target as Element).closest<HTMLAnchorElement>(
        "a[href]"
      )
      if (!link || link.target === "_blank" || link.hasAttribute("download"))
        return
      const url = new URL(link.href, window.location.href)
      if (
        url.origin !== location.origin ||
        url.pathname !== location.pathname ||
        url.search !== location.search ||
        !url.hash
      )
        return
      let target: HTMLElement | null
      try {
        target = document.getElementById(decodeURIComponent(url.hash.slice(1)))
      } catch {
        return
      }
      if (!target) return
      event.preventDefault()
      // A scrollbar drag, focus jump or native scroll can interrupt momentum.
      // Start the next anchor from the actual position, not its stale eased target.
      lenis.scrollTo(lenis.actualScroll, { immediate: true, force: true })
      navigate(
        { pathname: url.pathname, search: url.search, hash: url.hash },
        { preventScrollReset: true }
      )
      lenis.scrollTo(target, {
        onComplete: () => {
          if (url.hash === "#main") {
            target.setAttribute("tabindex", "-1")
            target.focus({ preventScroll: true })
          }
        },
      })
    }
    root.addEventListener("click", anchor as EventListener)
    const syncLock = () => {
      if (root.querySelector(".workspace-demo[data-opening]")) lenis.stop()
      else lenis.start()
    }
    const observer = new MutationObserver(syncLock)
    observer.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-opening"],
    })
    syncLock()
    return () => {
      observer.disconnect()
      root.removeEventListener("click", anchor as EventListener)
      lenis.destroy()
    }
  }, [header, contactOpen, navigate])
}
