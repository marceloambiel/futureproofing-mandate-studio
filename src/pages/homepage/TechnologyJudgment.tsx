import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DiscussionShowcase, DiscussionToolbarPreview } from './ProductValue'
import './technology-judgment.css'

function ContextPreview() {
  return <div className="product-interface tech-context-preview" aria-label="Application navigation and assignment overview illustration">
    <div className="product-interface-bar"><span>Assignment workspace</span><span>Interface illustration</span></div>
    <div className="tech-shell-preview">
      <aside className="tech-shell-nav" aria-label="Read-only application navigation"><img src="/brand/mandate-studio.svg" alt="Mandate Studio" width="124" height="16"/><span>Home</span><span className="tech-shell-active">Assignments</span><span>Experts</span></aside>
      <div className="tech-assignment-preview"><div className="tech-workflow-preview" aria-label="Assignment workflow labels"><span>Overview</span><span>Candidates</span><span>Discussion brief</span></div>
        <h4>Assignment overview</h4><dl><div><dt>Assignment summary</dt><dd>Business context, priorities and capabilities.</dd></div><div><dt>Client brief</dt><dd>The current requirements and their context.</dd></div><div><dt>Candidate assessments</dt><dd>Relevant evidence and unanswered questions.</dd></div><div><dt>Discussion materials</dt><dd>A shared foundation for review.</dd></div></dl>
      </div>
    </div>
  </div>
}

function RevisionPreview() {
  const [version, setVersion] = useState<'current' | 'earlier'>('current')
  return <div className="product-interface tech-revisions" aria-label="Editor toolbar and discussion version history illustration">
    <div className="product-interface-bar"><span>Discussion document</span><span>Read-only illustration</span></div>
    <DiscussionToolbarPreview/>
    <div className="tech-revision-content"><h4>Version history</h4><div className="tech-version-list" role="group" aria-label="Illustrative discussion versions">
      <Button variant="ghost" aria-pressed={version === 'current'} onClick={() => setVersion('current')}>Current draft<span>Latest discussion context</span></Button>
      <Button variant="ghost" aria-pressed={version === 'earlier'} onClick={() => setVersion('earlier')}>Earlier draft<span>Preserved for reference</span></Button>
    </div><div className="tech-revision-excerpt" role="status"><h5>{version === 'current' ? 'Current discussion focus' : 'Earlier discussion focus'}</h5><p>{version === 'current' ? 'Review the evidence, trade-offs and questions in the latest context.' : 'Revisit the priorities that informed the earlier discussion.'}</p></div></div>
  </div>
}

function ReviewPreview() {
  const [open, setOpen] = useState(false)
  return <>
    <div className="product-interface tech-review-preview" aria-label="Document review and submission interface illustration">
      <div className="product-interface-bar"><span>Discussion brief</span><span>Interface illustration</span></div>
      <div className="tech-review-content"><span className="tech-draft-tag">Saved draft</span><h4>Review before sharing</h4><p>Assess the evidence, refine the questions and confirm the document is ready for review.</p><div className="tech-review-readiness"><span>Human review required</span><span>Submission locks this version</span></div><Button variant="outline" onClick={() => setOpen(true)}>Preview review step</Button></div>
    </div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent confirmation className="workspace-dialog tech-review-dialog"><DialogHeader><DialogTitle>Send for review?</DialogTitle><DialogDescription>This action can’t be undone. This version will be locked; any further changes must be made in a new draft.</DialogDescription></DialogHeader><p className="tech-dialog-disclosure">Interface preview only. No document will be sent.</p><div className="workspace-actions tech-review-actions"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button disabled>Send for review</Button></div></DialogContent></Dialog>
  </>
}

export function TechnologyJudgment() {
  const id = useId()
  const root = useRef<HTMLElement>(null)
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const element = root.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setEntered(true); observer.disconnect() }
    }, { rootMargin: '0px 0px -64px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return <section ref={root} id="technology-judgment" data-nav-theme="dark" data-entered={entered} className="homepage-section technology-judgment" aria-labelledby={`${id}-title`}>
    <div className="homepage-container">
      <header className="tech-intro"><p className="eyebrow">The Mandate Studio workspace</p><h2 id={`${id}-title`} className="homepage-heading">Built to support the thinking behind every search.</h2><p className="homepage-copy">A connected working environment keeps information organized, reduces repetitive preparation, and makes the reasoning behind recommendations easier to understand.</p></header>
      <div className="tech-grid">
        <article className="tech-card tech-card-context"><div className="tech-card-copy"><h3>Everything in context</h3><p>Keep assignment requirements, candidate assessments, and discussion materials connected.</p></div><ContextPreview/></article>
        <article className="tech-card tech-card-document"><div className="tech-card-copy"><h3>AI-assisted preparation</h3><p>Turn existing information into structured first drafts, ready for professional review.</p></div><DiscussionShowcase/></article>
        <article className="tech-card tech-card-refine"><div className="tech-card-copy"><h3>Room to refine</h3><p>Edit documents, revisit earlier versions, and respond as new information becomes available.</p></div><RevisionPreview/></article>
        <article className="tech-card tech-card-review"><div className="tech-card-copy"><h3>Human judgment at every stage</h3><p>Technology helps organize the work. Consultants remain responsible for assessments and recommendations.</p></div><ReviewPreview/></article>
      </div>
      <p className="tech-illustration-note">Read-only interface illustrations. AI generation and review submission are simulated in the sample workspace.</p>
    </div>
  </section>
}
