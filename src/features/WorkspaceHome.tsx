import { useMobileLayout } from "@/hooks/use-mobile-layout"
import { useLayoutEffect, useRef, useState } from "react"
import {
  RiSendPlaneFill,
  RiSparklingLine,
  RiAddLine,
  RiAtLine,
  RiMicLine,
  RiSlashCommands2,
  RiArrowDownSLine,
  RiEqualizerLine,
} from "@remixicon/react"
import { ExecutiveDashboard } from "./ExecutiveDashboard"
import { HomeAssignmentNotification } from "@/components/workspace/HomeAssignmentNotification"
import "./workspace.css"

export function WorkspaceHome({ preview = false }: { preview?: boolean }) {
  const [message, setMessage] = useState("")
  const [expanded, setExpanded] = useState(false)
  const messageField = useRef<HTMLTextAreaElement>(null)
  const mobile = useMobileLayout()
  const [sendAttempted, setSendAttempted] = useState(false)
  const unavailableMessage = "Assistant unavailable in this demo."
  const warningId = preview
    ? "preview-assistant-mobile-warning"
    : "assistant-mobile-warning"
  useLayoutEffect(() => {
    const field = messageField.current
    if (!field) return
    const resize = () => {
      const previousScroll = field.scrollTop
      const followCaret = field.selectionEnd === field.value.length
      const lineHeight = parseFloat(getComputedStyle(field).lineHeight)
      field.style.height = "0px"
      const height =
        expanded && message
          ? Math.min(Math.max(field.scrollHeight, lineHeight), lineHeight * 2)
          : lineHeight
      field.style.height = `${height}px`
      field.form?.style.setProperty("--assistant-text-height", `${height}px`)
      field.scrollTop = expanded
        ? followCaret
          ? field.scrollHeight
          : previousScroll
        : 0
    }
    resize()
    let width = field.getBoundingClientRect().width
    let previousLineHeight = getComputedStyle(field).lineHeight
    const update = () => {
      const nextWidth = field.getBoundingClientRect().width
      const nextLineHeight = getComputedStyle(field).lineHeight
      if (nextWidth !== width || nextLineHeight !== previousLineHeight) {
        width = nextWidth
        previousLineHeight = nextLineHeight
        resize()
      }
    }
    const observer = new ResizeObserver(update)
    const textObserver = new MutationObserver(update)
    textObserver.observe(field, {
      attributes: true,
      attributeFilter: ["style", "class"],
    })
    observer.observe(field)
    return () => {
      observer.disconnect()
      textObserver.disconnect()
    }
  }, [message, expanded, mobile])
  return (
    <section
      className={`workspace-page workspace-home ${preview ? "workspace-home-preview" : ""}`}
    >
      <header className="home-assistant-header">
        <h1>
          <span className="home-greeting-first">
            <RiSparklingLine aria-hidden="true" /> Hey Caroline, let's
          </span>{" "}
          <span className="home-greeting-second">
            tackle your queue together
          </span>
        </h1>
        <form
          className={`home-assistant-input ${expanded ? "is-expanded" : ""}`}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setExpanded(false)
              if (event.target instanceof HTMLTextAreaElement)
                event.target.scrollTop = 0
            }
          }}
          onSubmit={(event) => {
            event.preventDefault()
            if (mobile) setSendAttempted(true)
          }}
        >
          <label
            className="sr-only"
            htmlFor={
              preview ? "preview-assistant-message" : "assistant-message"
            }
          >
            Message your assistant
          </label>
          <textarea
            ref={messageField}
            rows={1}
            onFocus={() => setExpanded(true)}
            id={preview ? "preview-assistant-message" : "assistant-message"}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask anything about your assignments…"
            autoComplete="off"
          />
          <div className="assistant-composer-toolbar">
            <div
              className="assistant-composer-tools"
              role="group"
              aria-label="Assistant tools"
            >
              <button type="button" disabled aria-label="Add attachment">
                <RiAddLine aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled
                aria-label="Mention a person or assignment"
              >
                <RiAtLine aria-hidden="true" />
              </button>
              <button type="button" disabled aria-label="Voice input">
                <RiMicLine aria-hidden="true" />
              </button>
              <button type="button" disabled aria-label="Assistant commands">
                <RiSlashCommands2 aria-hidden="true" />
              </button>
            </div>
            <div className="assistant-composer-actions">
              <button type="button" className="assistant-model-button" disabled>
                Auto
                <RiArrowDownSLine aria-hidden="true" />
              </button>
              <button
                type="button"
                className="assistant-options-button"
                disabled
                aria-label="Assistant settings"
              >
                <RiEqualizerLine aria-hidden="true" />
              </button>
              <span className="assistant-send-tooltip">
                <button
                  type="button"
                  aria-label="Send message"
                  aria-disabled="true"
                  onClick={() => {
                    if (mobile) setSendAttempted(true)
                  }}
                  aria-describedby={
                    mobile
                      ? sendAttempted
                        ? warningId
                        : undefined
                      : preview
                        ? "preview-assistant-unavailable"
                        : "assistant-unavailable"
                  }
                >
                  <RiSendPlaneFill aria-hidden="true" />
                </button>
                <span
                  className="assistant-unavailable-tooltip"
                  role="tooltip"
                  id={
                    preview
                      ? "preview-assistant-unavailable"
                      : "assistant-unavailable"
                  }
                >
                  {unavailableMessage}
                </span>
              </span>
            </div>
          </div>
        </form>
        {mobile && sendAttempted && (
          <p id={warningId} className="assistant-mobile-warning" role="status">
            {unavailableMessage}
          </p>
        )}
      </header>
      {!preview && <HomeAssignmentNotification />}
      <ExecutiveDashboard />
    </section>
  )
}
