import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { BriefShowcase, CandidateMatrixPreview, CandidateProfilePreview, DiscussionShowcase } from './ProductValue'
import './our-approach.css'

const stages = [
  { id: 'understand', title: 'Understand', description: 'Define the business context, priorities, and capabilities the organization needs.' },
  { id: 'explore', title: 'Explore', description: 'Examine candidates and their experience against the current requirements.' },
  { id: 'evaluate', title: 'Evaluate', description: 'Compare the evidence, understand the trade-offs, and identify remaining questions.' },
  { id: 'advise', title: 'Advise', description: 'Prepare a clear discussion that supports the next decision.' },
] as const

function DiscoveryPreview() {
  return <div className="product-interface" aria-label="Candidate discovery and profile interface illustration">
    <div className="product-interface-bar"><span>Candidate discovery</span><span>Interface illustration</span></div>
    <div className="product-candidate-grid">
      <div className="approach-discovery"><h4>Explore relevant experience</h4><p>Consider profiles against the current brief.</p>
        <article className="approach-discovery-overview"><h5>Candidate overview</h5><dl><div><dt>Career context</dt><dd>Review the responsibilities behind the experience.</dd></div><div><dt>Role requirements</dt><dd>Explore the capabilities the organization needs.</dd></div><div><dt>Evidence to explore</dt><dd>Keep supplied information and open questions visible.</dd></div></dl></article>
      </div>
      <CandidateProfilePreview/>
    </div>
  </div>
}

function EvaluationPreview() {
  return <div className="product-interface" aria-label="Candidate comparison interface illustration"><div className="product-interface-bar"><span>Structured evaluation</span><span>Interface illustration</span></div><CandidateMatrixPreview/></div>
}

export function OurApproach() {
  const [active, setActive] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const prefix = useId()
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % stages.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + stages.length - 1) % stages.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = stages.length - 1
    else return
    event.preventDefault()
    setActive(next)
    buttons.current[next]?.focus({ preventScroll: true })
  }
  return <section id="our-process" data-nav-theme="light" className="homepage-section our-approach" aria-labelledby={`${prefix}-title`}>
    <div className="homepage-container">
      <header className="approach-intro"><p className="eyebrow">Our approach</p><h2 id={`${prefix}-title`} className="homepage-heading">A considered process, from understanding to action.</h2><p className="homepage-copy">Every search begins with the business challenge. We bring structure to the information, clarity to the evaluation, and perspective to the decisions that follow.</p></header>
      <div className="approach-layout">
        <div className="approach-stage-selector" role="tablist" aria-label="Our approach stages" aria-orientation="vertical">
          {stages.map((stage, index) => <button key={stage.id} ref={element => { buttons.current[index] = element }} type="button" role="tab" id={`${prefix}-tab-${stage.id}`} aria-label={stage.title} aria-selected={active === index} aria-controls={`${prefix}-panel-${stage.id}`} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => navigate(event, index)}>
            <span className="approach-stage-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="approach-stage-text"><span className="approach-stage-title">{stage.title}</span><span className="approach-stage-description">{stage.description}</span></span>
          </button>)}
        </div>
        <div className="approach-previews">{stages.map((stage, index) => <div key={stage.id} role="tabpanel" id={`${prefix}-panel-${stage.id}`} aria-labelledby={`${prefix}-tab-${stage.id}`} tabIndex={0} hidden={active !== index} className="approach-panel">
          {active === index && <div className="approach-preview-enter"><h3 className="sr-only">{stage.title}: product preview</h3><p className="approach-mobile-task">{stage.description}</p>
            {stage.id === 'understand' && <BriefShowcase/>}
            {stage.id === 'explore' && <DiscoveryPreview/>}
            {stage.id === 'evaluate' && <EvaluationPreview/>}
            {stage.id === 'advise' && <DiscussionShowcase/>}
          </div>}
        </div>)}<p className="approach-preview-note">Illustrative, read-only workspace views.</p></div>
      </div>
    </div>
  </section>
}
