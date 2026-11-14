export const embeddedChannel = "mandate-workspace-v1"
export type EmbeddedState = {
  kind: "state"
  route: string
  dirty: boolean
  overlayOpen: boolean
}
export type EmbeddedFlow = {
  kind: "flow"
  candidatesAvailable: boolean
  discussionAvailable: boolean
}
export type EmbeddedEvent =
  | EmbeddedState
  | EmbeddedFlow
  | { kind: "return"; conversation?: boolean }
  | { kind: "entered" }
  | { kind: "boundary"; direction: "next" | "previous" }
  | { kind: "discarded" }
export type EmbeddedCommand =
  | { kind: "navigate"; route: string }
  | { kind: "presentation"; expanded: boolean }
  | { kind: "status" | "discard" | "focus-first" | "focus-last" }
export function embeddedHostAvailable() {
  try {
    return (
      window.parent !== window &&
      window.parent.location.origin === window.location.origin &&
      new URLSearchParams(window.location.search).get("preview") === "1"
    )
  } catch {
    return false
  }
}
export function postEmbeddedEvent(event: EmbeddedEvent) {
  if (embeddedHostAvailable())
    window.parent.postMessage(
      { channel: embeddedChannel, ...event },
      window.location.origin
    )
}
