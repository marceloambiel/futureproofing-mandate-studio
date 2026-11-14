import { useMobileLayout } from '@/hooks/use-mobile-layout'
import { useRef, useState } from 'react'
import { RiAddLine, RiCloseLine, RiCheckLine, RiSearchLine, RiGraduationCapLine, RiMapPinLine, RiSparklingLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ConfirmCandidateRemoval } from '@/components/workspace/ConfirmCandidateRemoval'
import { CandidateAvatar } from '@/components/workspace/CandidateProfile'
import { candidates, mandate, type Candidate } from '@/domain/model'
import { candidateDirectory } from '@/domain/candidate-directory'
import { useWorkspaceV2 } from '@/state/WorkspaceV2Provider'
import './candidate-cards.css'

export function CandidateOverviewCard({candidate,onSelect,included=true}:{candidate:Candidate;onSelect:(candidate:Candidate)=>void;included?:boolean}) {
  const mobile=useMobileLayout()
  const {setIncluded}=useWorkspaceV2()
  const profile=candidateDirectory[candidate.id]
  return <li className="candidate-overview-card" data-candidate-id={candidate.id}>
            <button className="candidate-card-open" type="button" onClick={()=>onSelect(candidate)} aria-label={`View full profile for ${candidate.name}`}>
              <span className="candidate-profile-heading"><CandidateAvatar id={candidate.id}/><span className="candidate-heading-copy"><span className="candidate-card-name">{candidate.name}</span><span className="candidate-card-role">{profile.title} · {profile.employer}</span></span></span>
              <span className="candidate-card-meta"><span><RiMapPinLine aria-hidden="true"/><span>{profile.location}</span></span><span><RiGraduationCapLine aria-hidden="true"/>{profile.education}</span></span>
              <span className="candidate-profile-summary"><RiSparklingLine aria-hidden="true"/><span><mark className="candidate-match">{profile.years} years of experience</mark> in operations, focused on <mark className={candidate.integration.kind==='provided'||candidate.scale.kind==='provided'?'candidate-match':'candidate-attention'}>{profile.skills[0].toLowerCase()}</mark> and {profile.skills[1].toLowerCase()}. Available in <mark className={candidate.availabilityDays<=mandate.startWithinDays?'candidate-match':'candidate-attention'} title={candidate.availabilityDays<=mandate.startWithinDays?'Within the client’s 60-day start target':'Beyond the client’s 60-day start target'}>{candidate.availabilityDays} days</mark>.</span></span>
              <span className="candidate-profile-question">To confirm: {candidate.limitation}</span>
            </button>
            <div className="candidate-card-actions"><button className="candidate-card-view" type="button" onClick={()=>onSelect(candidate)} aria-label={`View full profile: ${candidate.name}`}>View full profile</button>{included?<ConfirmCandidateRemoval candidate={candidate}><button className="candidate-card-remove" type="button" aria-label={`Remove ${candidate.name} from selection`} title="Remove candidate">{mobile?<RiCloseLine aria-hidden="true"/>:'Remove'}</button></ConfirmCandidateRemoval>:<button className="candidate-card-view" type="button" onClick={()=>setIncluded(candidate.id,true)}>Add to shortlist</button>}</div>
          </li>
}

export function IncludedProfiles({onSelect}:{onSelect:(candidate:Candidate)=>void}) {
  const mobile=useMobileLayout()
  const {includedIds,setIncluded}=useWorkspaceV2()
  const [adding,setAdding]=useState(false)
  const [query,setQuery]=useState('')
  const addTrigger=useRef<HTMLButtonElement>(null)
  const selected=candidates.filter(candidate=>includedIds.includes(candidate.id))
  const matches=candidates.filter(candidate=>{
    const profile=candidateDirectory[candidate.id]
    return `${candidate.name} ${profile.title} ${profile.employer} ${profile.location}`.toLowerCase().includes(query.trim().toLowerCase())
  })
  const addButton=<Button ref={addTrigger} className="candidate-add-trigger" variant="outline" onClick={()=>{setQuery('');setAdding(true)}}><RiAddLine aria-hidden="true"/>Add candidates</Button>
  return <>
    <section className="workspace-section assignment-profiles candidate-selection">
      <div className="workspace-section-heading"><div><div className="candidate-list-heading"><h2>Included profiles</h2><span>{selected.length}</span></div><p className="workspace-muted">Pre-selected from the Mandate Studio database for this search. Review each profile to confirm fit.</p></div>{!mobile&&addButton}</div>
      <ul className="candidate-overview-list">
        {selected.map(candidate=>{
          return <CandidateOverviewCard key={candidate.id} candidate={candidate} onSelect={onSelect}/>
        })}
      </ul>
      {!selected.length&&<div className="candidate-selection-empty"><h3>No candidates selected</h3><p>Add candidates from the database to build your list.</p></div>}
      {mobile&&addButton}
    </section>
    <Dialog open={adding} onOpenChange={setAdding}>
      <DialogContent className="workspace-dialog candidate-database-dialog" finalFocus={addTrigger}>
        <DialogHeader><DialogTitle>Add candidates</DialogTitle><DialogDescription>Browse the sample Mandate Studio database and add profiles to this search.</DialogDescription></DialogHeader>
        <label className="candidate-database-search"><span className="sr-only">Search candidates</span><RiSearchLine aria-hidden="true"/><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search by name, role or location"/></label>
        <div className="candidate-database-results">{matches.map(candidate=>{const profile=candidateDirectory[candidate.id];const included=includedIds.includes(candidate.id);return <div className="candidate-database-row" key={candidate.id}><CandidateAvatar id={candidate.id}/><div><strong>{candidate.name}</strong><p>{profile.title}</p><span>{profile.location} · {candidate.availabilityDays}-day availability</span></div><Button variant={included?'ghost':'outline'} disabled={included} onClick={()=>setIncluded(candidate.id,true)} aria-label={included?`${candidate.name} already selected`:`Add ${candidate.name} to selection`}>{included?<><RiCheckLine aria-hidden="true"/>Added</>:<><RiAddLine aria-hidden="true"/>Add</>}</Button></div>})}</div>
        {!matches.length&&<p className="workspace-muted" role="status">No candidates match this search.</p>}
        <p className="candidate-database-count" role="status">{includedIds.length} of {candidates.length} database profiles selected.</p>
      </DialogContent>
    </Dialog>
  </>
}
