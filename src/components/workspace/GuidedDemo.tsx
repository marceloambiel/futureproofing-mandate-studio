import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useBeforeUnload, useBlocker } from 'react-router-dom'
import { RiArrowRightLine, RiCloseLine, RiExpandDiagonalLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { embeddedChannel, type EmbeddedCommand, type EmbeddedFlow, type EmbeddedState } from '@/domain/embedded-workspace'
import './guided-workspace.css'

const stages = [
  { route: '/workspace/assignment', title: 'Review the changed brief', text: 'Understand the revised priority, then use Match candidates to brief in the workspace to continue.' },
  { route: '/workspace/candidates', title: 'Compare the evidence', text: 'Explore the profiles and trade-offs. Use Prepare Discussion Brief in the workspace when your selection is ready.' },
  { route: '/workspace/discussion', title: 'Prepare the discussion', text: 'Review and edit the draft, save a version, then send it for review. Submission is simulated locally in this sample.' },
]

function controlsIn(root: HTMLElement | null) {
  return root ? [...root.querySelectorAll<HTMLElement>('button,a[href],iframe')].filter(element => !element.matches(':disabled') && element.getClientRects().length > 0) : []
}

export function GuidedDemo({ onRequestConversation }: { onRequestConversation?: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [workspace, setWorkspace] = useState<EmbeddedState>({ kind: 'state', route: '/workspace', dirty: false, overlayOpen: false })
  const [flow, setFlow] = useState<EmbeddedFlow>({ kind: 'flow', candidatesAvailable: false, discussionAvailable: false })
  const trigger = useRef<HTMLButtonElement>(null)
  const expandTrigger = useRef<HTMLButtonElement>(null)
  const returnToExpand = useRef(false)
  const closeButton = useRef<HTMLButtonElement>(null)
  const footer = useRef<HTMLElement>(null)
  const surface = useRef<HTMLDivElement>(null)
  const scrollPosition = useRef(0)
  const returnFocus = useRef<HTMLElement | null>(null)
  const id = useId()
  const blocker = useBlocker(({ currentLocation, nextLocation }) => workspace.dirty && currentLocation.pathname !== nextLocation.pathname)
  useBeforeUnload(event => { if (workspace.dirty) { event.preventDefault(); event.returnValue = '' } })
  useEffect(() => { if (window.location.hash === '#sample-workspace') surface.current?.closest('#sample-workspace')?.scrollIntoView({ block: 'start', behavior: 'instant' }) }, [])
  const send = useCallback((command: EmbeddedCommand) => frame.current?.contentWindow?.postMessage({ channel: embeddedChannel, ...command }, window.location.origin), [frame])
  const collapse = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPosition.current, behavior: 'instant' })
      ;(returnToExpand.current ? expandTrigger.current : returnFocus.current?.isConnected ? returnFocus.current : trigger.current)?.focus({ preventScroll: true })
    })
  }, [])
  const expand = useCallback((enterAssignment: boolean) => {
    if (!open) {
      returnToExpand.current = document.activeElement === expandTrigger.current
      scrollPosition.current = window.scrollY
      returnFocus.current = document.activeElement instanceof HTMLElement && document.activeElement !== frame.current ? document.activeElement : trigger.current
      setOpen(true)
    }
    if (enterAssignment && ['/workspace', '/workspace/home', '/workspace/experts'].includes(workspace.route)) send({ kind: 'navigate', route: stages[0].route })
  }, [open, workspace.route, send, frame])
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.channel !== embeddedChannel) return
      const data = event.data
      if (data.kind === 'state' && typeof data.route === 'string' && typeof data.dirty === 'boolean') { send({ kind: 'presentation', expanded: open }); setWorkspace({ kind: 'state', route: data.route, dirty: data.dirty, overlayOpen: data.overlayOpen === true }); setReady(true) }
      if (data.kind === 'flow' && typeof data.candidatesAvailable === 'boolean' && typeof data.discussionAvailable === 'boolean') setFlow({ kind: 'flow', candidatesAvailable: data.candidatesAvailable, discussionAvailable: data.discussionAvailable })
      if (data.kind === 'entered') expand(false)
      if (data.kind === 'return') { if (open) collapse(); else trigger.current?.focus({ preventScroll: true }); if (data.conversation) requestAnimationFrame(() => onRequestConversation?.()) }
      if (data.kind === 'boundary' && open) {
        if (data.direction === 'previous') closeButton.current?.focus()
        else (controlsIn(footer.current)[0] ?? closeButton.current)?.focus()
      }
      if (data.kind === 'discarded') { setWorkspace(value => ({ ...value, dirty: false })); if (blocker.state === 'blocked') blocker.proceed() }
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [frame, open, expand, collapse, blocker, onRequestConversation, send])

  useEffect(() => { send({ kind: 'presentation', expanded: open }) }, [open, send])

  useLayoutEffect(() => {
    const element = surface.current
    if (!open || !element) return
    const changed: [HTMLElement, boolean][] = []
    let node: HTMLElement = element
    while (node.parentElement) {
      const parent = node.parentElement
      for (const sibling of parent.children) if (sibling !== node && sibling instanceof HTMLElement) { changed.push([sibling, sibling.inert]); sibling.setAttribute('inert', '') }
      if (parent === document.body) break
      node = parent
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus({ preventScroll: true })
    return () => { changed.forEach(([sibling, inert]) => { sibling.toggleAttribute('inert', inert) }); document.body.style.overflow = overflow }
  }, [open])

  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (!open || event.defaultPrevented) return
    if (event.key === 'Escape') { event.preventDefault(); collapse() }
    if (event.key !== 'Tab') return
    const controls = controlsIn(event.currentTarget)
    const first = controls[0], last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    else if (!event.shiftKey && document.activeElement === closeButton.current) { event.preventDefault(); frame.current?.focus(); send({ kind: 'focus-first' }) }
    else if (event.shiftKey && document.activeElement === controlsIn(footer.current)[0]) { event.preventDefault(); frame.current?.focus(); send({ kind: 'focus-last' }) }
  }
  const step = stages.findIndex(stage => stage.route === workspace.route)
  const completed = workspace.route === '/workspace/completed'
  const title = completed ? 'Assignment completed' : step < 0 ? 'Your consultant workspace' : stages[step].title
  const text = completed ? 'Your preparation is complete. Explore the submitted assignment, restart the sample, or request a conversation.' : step < 0 ? 'Open the assignment notification or current assignment to start. Your progress stays in this browser.' : stages[step].text
  const nextAvailable = step === 0 ? flow.candidatesAvailable : step === 1 ? flow.discussionAvailable : true
  return <div className="guided-workspace">
    <div className="demo-entry"><Button ref={trigger} size="lg" disabled={!ready} onClick={() => expand(true)}>Step into the consultant's seat<RiArrowRightLine aria-hidden="true"/></Button><p>An interactive fictional assignment. No account required.</p></div>
    <div ref={surface} className={`demo-frame-host ${open ? 'is-expanded' : ''}`} role={open ? 'dialog' : undefined} aria-modal={open ? true : undefined} aria-labelledby={open ? `${id}-title` : undefined} aria-describedby={open ? `${id}-description` : undefined} onKeyDown={keyboard}>
      {open ? <header className="demo-guide-header"><div><p className="demo-guide-kicker">{step >= 0 ? `Guided sample · ${step + 1} of ${stages.length}` : 'Guided sample'}</p><h2 id={`${id}-title`}>{title}</h2><p id={`${id}-description`}>{text}</p></div><Button ref={closeButton} variant="ghost" size="icon" aria-label="Return to website" onClick={collapse}><RiCloseLine aria-hidden="true"/></Button></header> : <div className="demo-frame-chrome"><span>Mandate Studio · Interactive sample</span><Button ref={expandTrigger} variant="ghost" disabled={!ready} onClick={() => expand(false)}>Expand workspace<RiExpandDiagonalLine aria-hidden="true"/></Button></div>}
      <div className="demo-frame-viewport"><iframe ref={frame} src="/workspace?preview=1" title="Interactive Mandate Studio sample workspace Home" loading="lazy" onLoad={() => send({ kind: 'status' })}/></div>
      {open && <footer ref={footer} className="demo-guide-footer"><div><Button variant="ghost" onClick={collapse}>Return to website</Button><Link to="/workspace">Open standalone workspace</Link></div><div><Button variant="outline" disabled={step <= 0 || workspace.overlayOpen} onClick={() => send({ kind: 'navigate', route: stages[step - 1].route })}>Back</Button>{step < 2 && !completed ? <Button disabled={!ready || workspace.overlayOpen || (step >= 0 && !nextAvailable)} onClick={() => send({ kind: 'navigate', route: stages[step < 0 ? 0 : step + 1].route })}>{step < 0 ? 'Open assignment' : 'Next'}<RiArrowRightLine aria-hidden="true"/></Button> : <Button onClick={collapse}>Return to website<RiArrowRightLine aria-hidden="true"/></Button>}</div></footer>}
    </div>
    <p className="demo-sample-caption">Fictional sample data. Explore the dashboard or enter the guided experience. Changes stay in this browser; no real assignment is submitted.</p>
    <Dialog open={blocker.state === 'blocked'} onOpenChange={value => { if (!value && blocker.state === 'blocked') blocker.reset() }}><DialogContent confirmation className="workspace-dialog" finalFocus={() => open ? frame.current : trigger.current}><DialogHeader><DialogTitle>Unsaved sample changes</DialogTitle><DialogDescription>Your document is still open in the sample. Keep editing, or discard unsaved changes before leaving the website.</DialogDescription></DialogHeader><div className="workspace-actions"><Button variant="outline" onClick={() => { if (blocker.state === 'blocked') blocker.reset(); expand(false); frame.current?.focus() }}>Keep editing</Button><Button variant="destructive" onClick={() => send({ kind: 'discard' })}>Discard and leave</Button></div></DialogContent></Dialog>
  </div>
}
