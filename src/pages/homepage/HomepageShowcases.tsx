import {useEffect,useRef} from 'react'
import {SectionActions, type ConversationAction} from './SectionActions'
import {RiArrowUpLine} from '@remixicon/react'
import {candidateDirectory} from '@/domain/candidate-directory'
import { clientBriefDocuments, type ClientBriefDocumentRecord } from '@/domain/v2'
import { candidates, mandate } from '@/domain/model'
import { getComparisonStatus } from '@/domain/comparison'
import './leadership-challenges.css'

// Read-only adapters over the same source records used by the assignment and history.
// No workspace providers, persistence or alternate matching rules belong in previews.
export function RequirementsPreview({ document }: { document: ClientBriefDocumentRecord }) {
  const original = clientBriefDocuments[1]
  const fields = document.facts.search.filter(field => ['priority', 'experience', 'first90'].includes(field.id))
  return <div className="challenge-product-preview" aria-label={`${document.label} requirements preview`}>
    <div className="challenge-preview-bar"><span>{document.label}</span><span>{document.version}</span></div>
    <div className="challenge-preview-content">
      <p className="challenge-preview-client">{document.facts.company.find(field => field.id === 'company')?.value}</p>
      <h4>{document.facts.role.find(field => field.id === 'role')?.value}</h4>
      <p className="challenge-preview-scope">{document.facts.company.find(field => field.id === 'footprint')?.value}</p>
      <dl>{fields.map(field => {
        const changed = document.version !== original.version && original.facts.search.find(previous => previous.id === field.id)?.value !== field.value
        return <div key={field.id}><dt>{field.label}{changed && field.id === 'priority' && <span className="challenge-new-tag">New</span>}</dt><dd>{field.value}</dd></div>
      })}</dl>
    </div>
  </div>
}

export function AvailabilityPreview() {
  return <div className="challenge-product-preview challenge-availability" aria-label="Candidate availability compared with the client target">
    <div className="challenge-preview-bar"><span>Candidate comparison</span><span>Start date</span></div>
    <div className="challenge-preview-content">
      <p className="challenge-preview-client">Client availability target</p>
      <h4>Within {mandate.startWithinDays} days</h4>
      <ul>{candidates.map(candidate => <li key={candidate.id}>
        <div><span className="challenge-candidate-name">{candidate.name}</span><span className="challenge-availability-value">{candidate.availabilityDays} days</span></div>
        <span className={`challenge-status challenge-status-${getComparisonStatus(candidate, 'availability')}`}>{getComparisonStatus(candidate, 'availability') === 'match' ? 'Within target' : 'Outside target'}</span>
      </li>)}</ul>
      <p className="challenge-evidence-note">Availability only. Experience and unanswered questions still need review.</p>
    </div>
  </div>
}

function CandidateTransitionPreview() {
  const current = candidates.find(candidate=>candidate.id==='B')!
  const previous = candidates.find(candidate=>candidate.id==='A')!
  return <div className="challenge-candidate-transition" role="group" aria-label="Candidate transition illustration">
    <div className="challenge-mini-candidate"><img src="/avatars/marcus-reed.png" alt="" loading="lazy" width="44" height="44"/><div><h4>{current.name}</h4><p>{candidateDirectory[current.id].title}</p></div></div>
    <RiArrowUpLine className="challenge-replacement-arrow" aria-hidden="true"/>
    <span className="sr-only">Illustration: the earlier candidate below is replaced by the candidate above.</span>
    <div className="challenge-mini-candidate is-previous"><img src="/avatars/claire-bennett.jpeg" alt="" loading="lazy" width="44" height="44"/><div><h4>{previous.name}</h4><p>{candidateDirectory[previous.id].title}</p></div></div>
  </div>
}

function PriorityHistoryPreview() {
  const historyTime = new Intl.DateTimeFormat('en-US', {dateStyle:'medium',timeStyle:'short',timeZone:'America/Chicago'})
  return <div className="challenge-product-preview challenge-priority-history" aria-label="Priority version history preview">
    <h4>Priority history</h4>
    <div className="field-history-list">{clientBriefDocuments.map((document,index)=><section key={document.version} className={index?'field-history-entry field-history-past':'field-history-entry'}>
      <h5>{index?'Past version':'Current'}</h5>
      <div className="field-history-value"><p>{document.facts.search.find(field=>field.id==='priority')?.value}</p><div className="field-history-source"><span>{document.version}</span><time dateTime={document.recordedAt}>{historyTime.format(new Date(document.recordedAt))} CST</time></div></div>
    </section>)}</div>
  </div>
}

function GrowthChartPreview() {
  const line = 'M24 224 C64 224 96 222 122 200 S176 100 204 76 S268 40 320 40'
  const points = [[24,224],[122,200],[163,138],[204,76],[320,40]]
  return <div className="challenge-product-preview challenge-growth-chart" aria-label="Illustrative growth in operational scale">
    <div className="challenge-growth-plot">
      <svg viewBox="0 0 344 280" role="img" aria-label="A rising line illustrates increasing operational scale; no business results are represented.">
        {[48,136,224].map(y=><line key={y} x1="24" x2="320" y1={y} y2={y} stroke="var(--border)"/>)}
        <g className="challenge-growth-series">
        <path d={`${line} L320 240 L24 240 Z`} fill="var(--chart-sage-fill)"/>
        <path d={line} fill="none" stroke="var(--chart-sage)" strokeWidth="1.5" strokeLinecap="round"/>
        {points.map(([x,y])=><circle key={x} cx={x} cy={y} r="4" fill="var(--chart-sage)" stroke="var(--card)" strokeWidth="2"/>)}
        </g>
        <text x="24" y="270">Today</text><text x="320" y="270" textAnchor="end">Next phase</text>
      </svg>
    </div>
  </div>
}

export function LeadershipChallenges({onRequestConversation}:ConversationAction) {
  const section=useRef<HTMLElement>(null)
  useEffect(()=>{
    const root=section.current!, preference=window.matchMedia('(prefers-reduced-motion: reduce)')
    let observer:IntersectionObserver | undefined
    const timers=new Map<HTMLElement,number>()
    const fades=new Map<HTMLElement,Animation>()
    const clearTimers=()=>{timers.forEach(timer=>window.clearTimeout(timer));timers.clear();fades.forEach(animation=>animation.cancel());fades.clear()}
    const setup=()=>{
      observer?.disconnect()
      clearTimers()
      delete root.dataset.motionReady
      if(preference.matches)return
      const cards=Array.from(root.querySelectorAll<HTMLElement>('.leadership-challenge'))
      const candidate=root.querySelector<HTMLElement>('.challenge-candidate-transition')!
      const claire=candidate.querySelector<HTMLElement>('.is-previous')!
      const containerRect=candidate.getBoundingClientRect(),claireRect=claire.getBoundingClientRect()
      candidate.style.setProperty('--claire-start-y',`${(containerRect.height-claireRect.height)/2-(claireRect.top-containerRect.top)}px`)
      root.dataset.motionReady='true'
      observer=new IntersectionObserver(entries=>{for(const entry of entries){
        const card=entry.target as HTMLElement
        window.clearTimeout(timers.get(card))
        timers.delete(card)
        if(!entry.isIntersecting || entry.intersectionRatio<.2){card.getAnimations({subtree:true}).forEach(animation=>animation.pause());continue}
        card.dataset.revealed='true'
        const repeat=()=>{
          fades.get(card)?.cancel()
          const animations=card.getAnimations({subtree:true}).filter(animation=>animation instanceof CSSAnimation)
          animations.forEach(animation=>{animation.currentTime=0;animation.play()})
          // Desktop cards share a 2.9s story, then rest together for 3s.
          const desktop=window.matchMedia('(min-width: 901px)').matches
          const duration=desktop?2900:Math.max(0,...animations.map(animation=>Number(animation.effect!.getComputedTiming().endTime)))
          const component=card.querySelector<HTMLElement>('.challenge-visual > div')!
          fades.set(card,component.animate([{opacity:1},{opacity:0}],{duration:200,delay:duration+(desktop?2100+cards.indexOf(card)*300:2700),easing:'ease',fill:'forwards'}))
          timers.set(card,window.setTimeout(repeat,duration+3000))
        }
        repeat()
      }},{threshold:.2})
      cards.forEach(card=>observer!.observe(card))
    }
    setup()
    preference.addEventListener('change',setup)
    return ()=>{observer?.disconnect();clearTimers();preference.removeEventListener('change',setup)}
  },[])
  return <section ref={section} id="challenges" className="homepage-section leadership-challenges" aria-labelledby="leadership-challenges-title">
    <div className="homepage-container">
      <header className="challenges-intro">
        <h2 id="leadership-challenges-title" className="homepage-heading">Leadership needs don't stand still.</h2>
        <p className="homepage-copy">As your business changes, so does the leadership it needs.<br/>We help bring those priorities into focus.</p>
      </header>
      <div className="challenges-grid">
        <article className="leadership-challenge" aria-labelledby="challenge-growth-title">
          <div className="challenge-visual challenge-visual-growth"><GrowthChartPreview/></div>
          <div className="challenge-copy"><h3 id="challenge-growth-title">Growth &amp; scale</h3><p>Expanding operations calls for leaders who can manage greater complexity without losing direction.</p></div>
        </article>
        <article className="leadership-challenge" aria-labelledby="challenge-integration-title">
          <div className="challenge-visual challenge-visual-transformation"><PriorityHistoryPreview/></div>
          <div className="challenge-copy"><h3 id="challenge-integration-title">Acquisitions &amp; transformation</h3><p>Acquisitions and business transformation can redefine the experience an organization needs from its next leader.</p></div>
        </article>
        <article className="leadership-challenge" aria-labelledby="challenge-timing-title">
          <div className="challenge-visual challenge-visual-transition"><CandidateTransitionPreview/></div>
          <div className="challenge-copy"><h3 id="challenge-timing-title">Critical leadership transitions</h3><p>Critical appointments call for a clear view of experience, timing, and the questions that still need answering.</p></div>
        </article>
      </div>
      
      <SectionActions onRequestConversation={onRequestConversation} primary="Discuss your leadership needs" secondary="Explore the sample workspace"/>
    </div>
  </section>
}
