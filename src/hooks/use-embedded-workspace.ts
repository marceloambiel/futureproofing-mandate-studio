import { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useWorkspace } from "@/state/WorkspaceProvider"
import {
  embeddedChannel,
  embeddedHostAvailable,
  postEmbeddedEvent,
  type EmbeddedCommand,
} from "@/domain/embedded-workspace"

const routes = new Set([
  "/workspace",
  "/workspace/home",
  "/workspace/experts",
  "/workspace/assignment",
  "/workspace/candidates",
  "/workspace/discussion",
])
function frameControls(root: ParentNode = document) {
  return [
    ...root.querySelectorAll<HTMLElement>(
      "a[href],button,input,textarea,select,[tabindex]"
    ),
  ].filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(":disabled") &&
      !element.closest("[inert],[hidden],[aria-hidden=true]") &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== "hidden"
  )
}
export function useEmbeddedWorkspace() {
  const expanded = useRef(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { dirty, session } = useWorkspace()
  useEffect(() => {
    if (!embeddedHostAvailable()) return
    const overlayOpen = () =>
      [
        ...document.querySelectorAll<HTMLElement>(
          "[role=dialog],[role=alertdialog],.notification-popup,[role=menu]"
        ),
      ].some((element) => element.getClientRects().length > 0)
    let lastOverlay = overlayOpen()
    const status = () => {
      lastOverlay = overlayOpen()
      postEmbeddedEvent({
        kind: "state",
        route: location.pathname,
        dirty,
        overlayOpen: lastOverlay,
      })
      window.dispatchEvent(new Event("mandate:request-flow"))
    }
    const observer = new MutationObserver(() => {
      if (overlayOpen() !== lastOverlay) status()
    })
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden", "data-open", "data-closed"],
    })
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.channel !== embeddedChannel
      )
        return
      const command = event.data as EmbeddedCommand
      if (
        command.kind === "presentation" &&
        typeof command.expanded === "boolean"
      )
        expanded.current = command.expanded
      if (
        command.kind === "navigate" &&
        routes.has(command.route) &&
        !overlayOpen()
      )
        navigate(command.route)
      if (command.kind === "status") status()
      if (command.kind === "discard") {
        session.cancelEdit()
        postEmbeddedEvent({ kind: "discarded" })
      }
      const modal = [
        ...document.querySelectorAll<HTMLElement>(
          "[role=dialog],[role=alertdialog]"
        ),
      ]
        .filter((element) => element.getClientRects().length > 0)
        .at(-1)
      if (command.kind === "focus-first")
        frameControls(modal ?? document)[0]?.focus()
      if (command.kind === "focus-last")
        frameControls(modal ?? document)
          .at(-1)
          ?.focus()
    }
    const click = (event: MouseEvent) => {
      const anchor = (
        event.target as Element | null
      )?.closest<HTMLAnchorElement>("a[href]")
      if (
        !anchor ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        anchor.target === "_blank"
      )
        return
      const url = new URL(anchor.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === "/") {
        event.preventDefault()
        postEmbeddedEvent({
          kind: "return",
          conversation: url.searchParams.get("conversation") === "1",
        })
      } else if (url.pathname === "/workspace/assignment")
        postEmbeddedEvent({ kind: "entered" })
    }
    const modalEvents = new WeakSet<Event>()
    const rememberModal = (event: KeyboardEvent) => {
      if (
        [
          ...document.querySelectorAll<HTMLElement>(
            "[role=dialog],[role=alertdialog],.notification-popup,[role=menu]"
          ),
        ].some((element) => element.getClientRects().length > 0)
      )
        modalEvents.add(event)
    }
    const key = (event: KeyboardEvent) => {
      if (!expanded.current) return
      const modal = [
        ...document.querySelectorAll<HTMLElement>(
          "[role=dialog],[role=alertdialog],.notification-popup,[role=menu]"
        ),
      ].some((element) => element.getClientRects().length > 0)
      if (event.defaultPrevented || modal || modalEvents.has(event)) return
      if (event.key === "Escape") {
        event.preventDefault()
        postEmbeddedEvent({ kind: "return" })
      }
      if (event.key === "Tab") {
        const controls = frameControls()
        if (
          (!event.shiftKey && document.activeElement === controls.at(-1)) ||
          (event.shiftKey && document.activeElement === controls[0])
        ) {
          event.preventDefault()
          postEmbeddedEvent({
            kind: "boundary",
            direction: event.shiftKey ? "previous" : "next",
          })
        }
      }
    }
    window.addEventListener("message", receive)
    document.addEventListener("click", click, true)
    document.addEventListener("keydown", rememberModal, true)
    window.addEventListener("keydown", key)
    status()
    return () => {
      observer.disconnect()
      window.removeEventListener("message", receive)
      document.removeEventListener("click", click, true)
      window.removeEventListener("keydown", key)
      document.removeEventListener("keydown", rememberModal, true)
    }
  }, [location.pathname, dirty, navigate, session])
}
