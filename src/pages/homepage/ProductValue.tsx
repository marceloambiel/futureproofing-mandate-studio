import {candidates} from '@/domain/model'
import {candidateDirectory} from '@/domain/candidate-directory'
import {comparisonCriteria, getComparisonStatus} from '@/domain/comparison'
import {getComparisonSource} from '@/domain/comparison-sources'
import { useId, useLayoutEffect, useRef, useState } from 'react'
import {useProductCardStack} from './use-product-card-stack'
import { EvidenceLabel } from '@/components/workspace/CandidateProfile'
import './product-value.css'

// Read-only, anonymized adapters of the real product layouts. No assignment data,
// provider, candidate scoring, editor commands or persistence is duplicated here.
const briefBreakdown = [
  {label:'Search priorities',previous:'Expansion and operational scale',current:'Operational integration and business transformation'},
  {label:'Relevant experience',previous:'Multi-site operations and growth',current:'Integration leadership and change management'},
  {label:'Leadership scope',previous:'Cross-functional teams and regional operations',current:'Cross-functional teams and regional operations'},
  {label:'Discussion focus',previous:'Growth responsibilities and leadership scope',current:'Integration ownership, operating context and open questions'},
] as const

export function BriefShowcase() {
  const [version, setVersion] = useState<'current' | 'previous'>('current')
  const id=useId()
  return <div className="product-interface product-brief" aria-label="Client brief and requirements interface illustration">
    <div className="product-brief-tabs" role="tablist" aria-label="Brief versions">{(['current','previous'] as const).map((item,index)=><button key={item} type="button" role="tab" id={`${id}-${item}`} data-version={item} aria-selected={version===item} aria-controls={`${id}-panel-${item}`} tabIndex={version===item?0:-1} onClick={()=>setVersion(item)} onKeyDown={event=>{
      if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return
      event.preventDefault()
      const next=event.key==='Home'?'current':event.key==='End'?'previous':index===0?'previous':'current'
      setVersion(next)
      event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-version="${next}"]`)?.focus()
    }}>{item==='current'?'Current brief':'Previous brief'}</button>)}</div>
    <div className="product-brief-versions">{(['current','previous'] as const).map(briefVersion=>(
    <div key={briefVersion} className="product-brief-grid" id={`${id}-panel-${briefVersion}`} role="tabpanel" tabIndex={0} aria-labelledby={`${id}-${briefVersion}`} aria-hidden={version!==briefVersion} inert={version!==briefVersion}>
      <article className="client-brief-document product-document" aria-label={`${briefVersion === 'current' ? 'Current' : 'Previous'} illustrative brief`}>
        <header className="client-brief-paper-title"><h4>Executive search brief</h4><p>Leadership priorities</p></header>
        <p className="client-brief-author">Leadership team<br/>{briefVersion==='current'?'Revised requirements':'Original requirements'}</p>
        <div className="client-brief-body"><section><h5>Business context</h5><p>{briefVersion === 'current' ? 'As business priorities evolve, focus on integration and operational alignment.' : 'Start with the organization’s direction and capacity for growth.'}</p></section>
          <section><h5>Experience and capabilities</h5><p>{briefVersion==='current'?'Seek integration leadership and experience aligning teams and processes.':'Seek multi-site leadership and experience building capacity.'}</p></section>
</div>
      </article>
      <aside className="product-brief-details" aria-label="Requirements breakdown illustration">
        <h4>Brief breakdown</h4><dl>{briefBreakdown.map(field=><div key={field.label}><dt>{field.label}{briefVersion==='current'&&field.current!==field.previous&&<span className="product-brief-new-tag">NEW</span>}</dt><dd>{field[briefVersion]}</dd></div>)}</dl>
      </aside>
    </div>
    ))}</div>
  </div>
}

export function CandidateMatrixPreview() {
  return <div className="product-matrix"><h4>Candidate comparison</h4><table className="v2-comparison-table"><caption className="sr-only">Illustrative comparison structure; no candidate results are represented.</caption><thead><tr><th scope="col">Role criteria</th><th scope="col">Evidence to examine</th></tr></thead><tbody>
        <tr><th scope="row">Relevant experience</th><td><span className="product-evidence-label">Supplied material</span><p>Responsibilities and operating context</p></td></tr>
        <tr><th scope="row">Leadership scope</th><td><EvidenceLabel kind="unverified"/><p>Clarify personal ownership</p></td></tr>
        <tr><th scope="row">Open questions</th><td><EvidenceLabel kind="unknown"/><p>Carry unanswered questions into discussion</p></td></tr>
      </tbody></table></div>
}

export function CandidateProfilePreview() {
  return <aside className="product-profile-drawer" aria-label="Read-only candidate profile drawer excerpt">
        <header className="candidate-full-header"><p>Profile excerpt</p><h4>Relevant experience</h4><span>Review responsibilities in context</span></header>
        <div className="candidate-profile-nav product-profile-nav" aria-label="Profile section labels"><span className="product-profile-active">Experience</span><span>Education</span><span>Projects</span><span>Skill Map</span></div>
        <div className="candidate-full-content"><article className="profile-career-record"><h5>Leadership responsibility</h5><p className="profile-record-meta">Career history · supplied information</p><div className="profile-record-description"><p>Examine the decisions the person owned, the teams they led and the context in which they worked.</p></div></article>
          <div className="product-profile-question"><span>Question for discussion</span><p>What was their personal responsibility, and what still needs verification?</p></div></div>
      </aside>
}

function CandidateShowcase() {
  const frame=useRef<HTMLDivElement>(null)
  const table=useRef<HTMLDivElement>(null)
  useLayoutEffect(()=>{
    const viewport=frame.current, content=table.current
    const brief=viewport?.closest('.product-value-features')?.querySelector<HTMLElement>('.product-brief')
    if(!viewport||!content||!brief)return
    const desktop=window.matchMedia('(min-width:1101px)')
    const fit=()=>{
      if(!desktop.matches){viewport.style.removeProperty('height');content.style.removeProperty('height');content.style.removeProperty('transform');return}
      viewport.style.height=`${brief.offsetHeight}px`
      const scale=viewport.clientWidth/content.offsetWidth
      content.style.height=`${viewport.clientHeight/scale}px`
      content.style.transform=`scale(${scale})`
    }
    const observer=new ResizeObserver(fit)
    ;[brief,viewport,content].forEach(element=>observer.observe(element))
    desktop.addEventListener('change',fit)
    fit()
    return ()=>{observer.disconnect();desktop.removeEventListener('change',fit)}
  },[])
  const labels={match:'Match',attention:'To confirm',unmet:'Not met',neutral:'Not provided'}
  return <div ref={frame} className="product-interface product-candidates product-comparison-full" role="region" tabIndex={0} aria-label="Candidate comparison table preview">
    <div ref={table} className="product-comparison-scaled"><table><caption className="sr-only">Fictional candidates against the client brief. Supplied evidence and unanswered questions remain distinct.</caption>
      <thead><tr><th scope="col">Role criteria</th>{candidates.map(candidate=><th key={candidate.id} scope="col">{candidate.name}</th>)}</tr></thead>
      <tbody>{comparisonCriteria.map(criterion=><tr key={criterion.id}><th scope="row">{criterion.label}</th>{candidates.map(candidate=>{
        const status=getComparisonStatus(candidate,criterion.id)
        const value=criterion.id==='location'?candidateDirectory[candidate.id].location:criterion.id==='availability'?`${candidate.availabilityDays} days`:candidate[criterion.id].text
        return <td key={candidate.id}><span className={`product-comparison-status is-${status}`}>{labels[status]}</span><p>{value}</p><span className="product-comparison-source">Source · {getComparisonSource(candidate,criterion.id).label}</span></td>
      })}</tr>)}</tbody>
    </table></div>
  </div>
}

export function DiscussionToolbarPreview() {
  return <div className="discussion-doc-toolbar product-editor-toolbar" aria-label="Read-only editor toolbar illustration"><span>11 pt</span><span className="product-toolbar-tools" aria-hidden="true"><b>B</b><i>I</i><u>U</u></span><span>Version history</span></div>
}

export function DiscussionShowcase() {
  return <div className="product-interface product-discussion" aria-label="Read-only discussion brief editor interface illustration">
    <div className="product-interface-bar"><span>Discussion brief</span><span>Draft · human review required</span></div>
    <DiscussionToolbarPreview/>
    <article className="discussion-doc-editor product-document" aria-label="Illustrative discussion document">
      <header><p className="product-document-kicker">AI-assisted draft · Review and edit in the workspace</p><h4>Leadership discussion brief</h4><p>Bring the evidence and the questions into one conversation.</p></header>
      <section><h5>1. Leadership priorities</h5><p>Confirm the business direction and the experience the role now calls for.</p></section>
      <section><h5>2. Evidence and trade-offs</h5><p>Consider relevant experience alongside its context, limitations and areas that need verification.</p></section>
      <section><h5>3. Questions to explore</h5><ul><li>Which responsibilities did the candidate personally own?</li><li>What further evidence would inform the discussion?</li></ul></section>
      <section><h5>4. Review before sharing</h5><p>Refine the document, save a version and prepare it for human review.</p></section>
    </article>
  </div>
}

function TrackingShowcase() {
  const id=useId()
  const sectors=[{size:37.5,color:'gold'},{size:18.75,color:'sage'},{size:25,color:'apricot'},{size:14.0625,color:'lilac'},{size:4.6875,color:'rose'}]
  const readiness=[{label:'Brief',values:[10,15,60,15]},{label:'Shortlist',values:[5,20,65,10]},{label:'Availability',values:[10,30,45,15]}]
  const activity='M12 110 C44 110 54 99 76 88 S118 40 140 40 S184 25 204 29 S246 37 268 40'
  return <div className="product-interface product-tracking" role="group" aria-label="Illustrative search tracking dashboard">
    <section className="product-tracking-card"><h4>Search activity</h4><svg viewBox="0 0 280 140" role="img" aria-label="Illustrative activity trend over time">
      {[30,70,110].map(y=><line key={y} x1="12" x2="268" y1={y} y2={y} stroke="var(--border)"/>)}
      <path d={`${activity} L268 110 L12 110Z`} fill="var(--chart-sage-fill)"/>
      <path d={activity} fill="none" stroke="var(--chart-sage)" strokeWidth="1" strokeLinecap="round"/>
      <circle cx="268" cy="40" r="4" fill="var(--chart-sage)" stroke="var(--card)" strokeWidth="2"/>
      <text x="12" y="134">Jan</text><text x="140" y="134" textAnchor="middle">Mar</text><text x="268" y="134" textAnchor="end">May</text>
    </svg></section>
    <section className="product-tracking-card"><h4>Candidates by sector</h4><svg viewBox="0 0 280 140" role="img" aria-label="Illustrative candidate coverage across sectors"><g transform="rotate(-90 140 70)">{sectors.map((sector,index)=>{
      const start=sectors.slice(0,index).reduce((sum,item)=>sum+item.size,0)
      const end=(start+sector.size)/100*Math.PI*2
      return <g key={sector.color}><circle cx="140" cy="70" r="50" pathLength="100" fill="none" stroke={`var(--chart-${sector.color})`} strokeWidth="8.2" strokeDasharray={`${sector.size} ${100-sector.size}`} strokeDashoffset={-start}/><circle cx="140" cy="70" r="50" pathLength="100" fill="none" stroke={`var(--chart-${sector.color}-fill)`} strokeWidth="6.7" strokeDasharray={`${sector.size} ${100-sector.size}`} strokeDashoffset={-start}/><line x1={140+Math.cos(end)*45.9} y1={70+Math.sin(end)*45.9} x2={140+Math.cos(end)*54.1} y2={70+Math.sin(end)*54.1} stroke={`var(--chart-${sector.color})`} strokeWidth=".75"/></g>
    })}</g><text x="140" y="74" textAnchor="middle">Sectors</text></svg></section>
    <section className="product-tracking-card"><h4>Search pipeline</h4><svg viewBox="0 10 300 160" role="img" aria-label="Illustrative pipeline stages">
      <defs><linearGradient id={`${id}-pipeline`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="var(--chart-gradient-start)"/><stop offset="55%" stopColor="var(--chart-gradient-mid)"/><stop offset="100%" stopColor="var(--chart-gradient-end)"/></linearGradient></defs>
      <path d="M35 140 A115 115 0 0 1 265 140" fill="none" stroke="var(--chart-pending-fill)" strokeWidth="11.5" strokeLinecap="round"/>
      <path d="M35 140 A115 115 0 0 1 207.5 40.4" fill="none" stroke="var(--chart-gold)" strokeWidth="14" strokeLinecap="round"/>
      <path d="M35 140 A115 115 0 0 1 207.5 40.4" fill="none" stroke={`url(#${id}-pipeline)`} strokeWidth="11.5" strokeLinecap="round"/>
      <text x="150" y="124" textAnchor="middle">Search stages</text>
    </svg></section>
    <section className="product-tracking-card"><h4>Search readiness</h4><svg viewBox="0 0 280 140" role="img" aria-label="Illustrative readiness across assignments">{readiness.map((row,rowIndex)=><g key={row.label}>
      <text x="12" y={33+rowIndex*36}>{row.label}</text>
      <defs><clipPath id={`${id}-readiness-${rowIndex}`}><rect x="104" y={24+rowIndex*36} width="164" height="11.5" rx="4"/></clipPath></defs>
      <g clipPath={`url(#${id}-readiness-${rowIndex})`}>{row.values.map((size,index)=>{
        const start=row.values.slice(0,index).reduce((sum,item)=>sum+item,0)
        const color=['apricot','gold','sage','pending'][index]
        const x=104+start*1.64,y=24+rowIndex*36,end=x+size*1.64
        return <g key={color}><rect x={x} y={y} width={size*1.64} height="11.5" fill={`var(--chart-${color}-fill)`}/><path d={`M${x} ${y+.5} H${end} M${x} ${y+11} H${end} M${end-.5} ${y} V${y+11.5}`} fill="none" stroke={`var(--chart-${color})`} strokeWidth="1"/>{index===0&&<path d={`M${x+.5} ${y} V${y+11.5}`} stroke={`var(--chart-${color})`} strokeWidth="1"/>}</g>
      })}</g>
    </g>)}</svg></section>
  </div>
}

export function ProductValue() {
  const id = useId()
  const featureStack=useRef<HTMLDivElement>(null)
  useProductCardStack(featureStack)
  return <section id="product-value" data-nav-theme="dark" className="homepage-section product-value" aria-labelledby={`${id}-title`}>
    <div className="homepage-container">
      <header className="product-value-intro"><h2 id={`${id}-title`} className="homepage-heading">Better understanding.<br/>More informed decisions.</h2><p className="homepage-copy">Connect changing priorities, candidate evidence, and professional judgment.</p></header>
      <div ref={featureStack} className="product-value-features">
        <article className="product-feature product-feature-brief"><div className="product-feature-copy"><h3>A brief that evolves with your business</h3><p>Keep requirements clear, understand changing priorities, and preserve the context behind every search.</p></div><BriefShowcase/></article>
        <article className="product-feature product-feature-candidates"><div className="product-feature-copy"><h3>Go deeper than candidate profiles</h3><p>Examine relevant experience, compare capabilities, and understand what still needs verification.</p></div><CandidateShowcase/></article>
        <article className="product-feature product-feature-tracking"><div className="product-feature-copy"><h3>Keep a clearer view of every search</h3><p>Track search activity, candidate coverage, and assignment progress to see where attention is needed.</p></div><TrackingShowcase/></article>
      </div>
      
    </div>
  </section>
}
