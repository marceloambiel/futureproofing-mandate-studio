import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  RiArrowRightLine,
  RiCloseLine,
  RiNotification3Line,
} from "@remixicon/react"
import { getAssignmentChanges, sampleAssignment } from "@/domain/v2"
import { useWorkspaceV2 } from "@/state/WorkspaceV2Provider"
import "./home-assignment-notification.css"

export function HomeAssignmentNotification() {
  const {
    presentedChangeIds,
    viewedChangeIds,
    acknowledgedChangeIds,
    markChangePresented,
  } = useWorkspaceV2()
  const eventId = getAssignmentChanges()[0]?.id
  const unread =
    !!eventId &&
    !viewedChangeIds.includes(eventId) &&
    !acknowledgedChangeIds.includes(eventId)
  const eligible = unread && !presentedChangeIds.includes(eventId!)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (!eligible || !eventId) return
    const timer = setTimeout(() => {
      setShown(true)
      markChangePresented(eventId)
    }, 600)
    return () => clearTimeout(timer)
  }, [eligible, eventId, markChangePresented])
  if (!shown || !unread) return null
  return (
    <div className="home-notification-viewport">
      <section
        className="home-assignment-notification"
        role="status"
        aria-labelledby="home-assignment-notification-title"
      >
        <Link
          className="home-assignment-notification-link"
          to="/workspace/assignment"
          aria-label="Review Northline Integration Search update"
        >
          <div className="home-assignment-notification-meta">
            <RiNotification3Line aria-hidden="true" />
            <span>Assignment update</span>
            <span className="notification-new-tag">NEW</span>
          </div>
          <h2 id="home-assignment-notification-title">
            {sampleAssignment.title}
          </h2>
          <p>The priority has changed to acquisition integration.</p>
          <span className="notification-action">
            Review update
            <RiArrowRightLine aria-hidden="true" />
          </span>
        </Link>
        <button
          type="button"
          className="home-assignment-notification-close"
          aria-label="Dismiss assignment notification"
          onClick={() => {
            setShown(false)
            document
              .querySelector<HTMLButtonElement>(".notification-trigger")
              ?.focus({ preventScroll: true })
          }}
        >
          <RiCloseLine aria-hidden="true" />
        </button>
      </section>
    </div>
  )
}
