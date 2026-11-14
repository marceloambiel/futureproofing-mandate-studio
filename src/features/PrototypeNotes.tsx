import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { RiArrowRightUpLine, RiGithubLine, RiPlayLine } from "@remixicon/react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import "./prototype-hub.css"

const destinations = [
  {
    title: "The website",
    description: "Discover Mandate’s executive-search approach.",
    to: "/",
    image: "/process/journey/website-desktop.jpg",
  },
  {
    title: "The demo",
    description: "Step into the consultant’s workspace.",
    to: "/workspace?restart=1",
    image: "/process/journey/dashboard-notification.jpg",
  },
  {
    title: "The design process",
    description: "Explore the thinking behind the prototype.",
    to: "/process",
    image: "/hub/design-process.jpg",
  },
]

const hubAccessKey = "mandate-studio:hub-access"

function hasHubAccess() {
  try {
    return sessionStorage.getItem(hubAccessKey) === "granted"
  } catch {
    return false
  }
}

export function PrototypeNotes() {
  const [videoOpen, setVideoOpen] = useState(false)
  const [unlocked, setUnlocked] = useState(hasHubAccess)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState(false)
  const title = useRef<HTMLHeadingElement>(null)
  const justUnlocked = useRef(false)
  useEffect(() => {
    if (unlocked && justUnlocked.current) title.current?.focus()
  }, [unlocked])

  if (!unlocked)
    return (
      <main className="prototype-hub prototype-hub-gate">
        <section
          className="prototype-hub-access"
          aria-labelledby="hub-access-title"
        >
          <h1 id="hub-access-title">FutureProofing prototype challenge</h1>
          <p>Enter the password to view the project hub.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (password !== "hiremarcelonow") {
                setPasswordError(true)
                return
              }
              try {
                sessionStorage.setItem(hubAccessKey, "granted")
              } catch {
                /* Access remains available in this page session. */
              }
              justUnlocked.current = true
              setPassword("")
              setUnlocked(true)
            }}
          >
            <label htmlFor="hub-password">Password</label>
            <input
              id="hub-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setPasswordError(false)
              }}
              aria-invalid={passwordError}
              aria-describedby={
                passwordError ? "hub-password-error" : undefined
              }
            />
            {passwordError && (
              <p id="hub-password-error" role="alert">
                Incorrect password. Please try again.
              </p>
            )}
            <button type="submit">
              View project hub
              <RiArrowRightUpLine aria-hidden="true" size={18} />
            </button>
          </form>
        </section>
      </main>
    )
  return (
    <main className="prototype-hub">
      <header className="prototype-hub-heading">
        <h1 ref={title} tabIndex={-1}>
          FutureProofing prototype challenge
        </h1>
        <div className="prototype-hub-author">
          <img
            src="/hub/marcelo-ambiel.png"
            alt="Marcelo Ambiel"
            width="48"
            height="48"
          />
          <div className="prototype-hub-author-copy">
            <p>by Marcelo Ambiel</p>
            <a
              className="prototype-hub-portfolio"
              href="https://marceloambiel.com/"
            >
              See Portfolio
            </a>
          </div>
        </div>
      </header>

      <div className="prototype-hub-grid">
        {destinations.map(({ title, description, to, image }) => (
          <article className="prototype-hub-card" key={to}>
            <Link to={to} className="prototype-hub-link">
              <div className="prototype-hub-preview">
                <img src={image} alt="" width="1440" height="1000" />
              </div>
              <div className="prototype-hub-caption">
                <h2>{title}</h2>
                <RiArrowRightUpLine aria-hidden="true" size={20} />
                <p>{description}</p>
              </div>
            </Link>
          </article>
        ))}
        <article className="prototype-hub-card prototype-hub-video-card">
          <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
            <div className="prototype-hub-preview">
              <img
                src="/hub/loom-walkthrough.jpg"
                alt=""
                width="1110"
                height="720"
              />
              <span className="prototype-hub-video-play">
                <RiPlayLine aria-hidden="true" size={28} />
              </span>
            </div>
            <div className="prototype-hub-caption">
              <h2>
                <DialogTrigger className="prototype-hub-video-trigger">
                  The Loom walkthrough
                </DialogTrigger>
              </h2>
              <RiPlayLine aria-hidden="true" size={20} />
              <p>A recorded tour of the experience.</p>
            </div>
            <DialogContent
              className="prototype-hub-video-dialog"
              aria-describedby={undefined}
            >
              <DialogTitle>The Loom walkthrough</DialogTitle>
              {videoOpen && (
                <iframe
                  className="prototype-hub-video-player"
                  src="https://www.loom.com/embed/979f7219f3ff46a5aa9f961a9a196160"
                  title="Mandate Studio project walkthrough"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
            </DialogContent>
          </Dialog>
        </article>
        <article className="prototype-hub-card">
          <a
            className="prototype-hub-link"
            href="https://github.com/marceloambiel/futureproofing-mandate-studio"
            target="_blank"
            rel="noreferrer"
          >
            <div className="prototype-hub-preview prototype-hub-placeholder">
              <RiGithubLine aria-hidden="true" size={48} />
              <span>GitHub</span>
            </div>
            <div className="prototype-hub-caption">
              <h2>The GitHub repository</h2>
              <RiArrowRightUpLine aria-hidden="true" size={20} />
              <p>Explore the project’s source code.</p>
            </div>
          </a>
        </article>
      </div>
    </main>
  )
}
