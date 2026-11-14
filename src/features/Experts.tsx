import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { RiArrowRightLine, RiSearchLine } from '@remixicon/react'
import { candidates } from '@/domain/model'
import { filterExperts } from '@/domain/v2'
import { useWorkspaceV2 } from '@/state/WorkspaceV2Provider'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CandidateFullProfile } from '@/components/workspace/CandidateFullProfile'
import { CandidateOverviewCard } from './IncludedProfiles'
import './workspace.css'
import './v2-candidates.css'

export function Experts() {
  const [query, setQuery] = useState('')
  const [availability, setAvailability] = useState<'all' | 'within-target'>('all')
  const [params, setParams] = useSearchParams()
  const { includedIds, persistence } = useWorkspaceV2()
  const records = filterExperts(query, availability)
  const candidateId = params.get('candidate')
  const selected = candidates.find(candidate => candidate.id === candidateId)
  function close() { const next = new URLSearchParams(params); next.delete('candidate'); setParams(next) }
  if (candidateId && !selected) return <section className="workspace-page experts-page"><h1>Candidate not found</h1><p>We couldn’t find that profile in the fictional sample directory.</p><Link to="/workspace/experts">Return to Experts</Link></section>
  return <section className="workspace-page experts-page">
    <header className="workspace-page-heading"><div><h1>Experts</h1><p className="workspace-muted">Browse the demo directory and manage the shortlist for your search.</p></div><Link className={buttonVariants({ variant: 'outline' })} data-slot="button" to="/workspace/candidates">Open comparison<RiArrowRightLine aria-hidden="true" /></Link></header>
    <form className="v2-directory-search" role="search" onSubmit={event => event.preventDefault()}><div><label htmlFor="expert-search">Search sample profiles</label><div className="v2-search-input"><RiSearchLine aria-hidden="true" /><Input type="search" id="expert-search" placeholder="Name or supplied experience" value={query} onChange={event => setQuery(event.target.value)} /></div></div><div><label htmlFor="expert-availability">Availability</label><select id="expert-availability" value={availability} onChange={event => setAvailability(event.target.value as 'all' | 'within-target')}><option value="all">All supplied profiles</option><option value="within-target">Within the 60-day target</option></select></div></form>
    {persistence === 'memory' && <p className="workspace-warning" role="status">Comparison choices are kept in this session only because browser saving is unavailable.</p>}
    <div className={`v2-comparison-layout ${selected ? 'v2-comparison-has-profile' : ''}`}><div className="v2-directory-list">
      <p className="workspace-muted" role="status">{records.length} of {candidates.length} supplied profiles</p>
      {records.length === 0 ? <section className="v2-directory-empty"><h2>No profiles match</h2><p>Try a candidate name or words from their experience.</p><Button variant="outline" onClick={() => { setQuery(''); setAvailability('all') }}>Clear filters</Button></section> : <ul className="candidate-overview-list">{records.map(candidate=><CandidateOverviewCard key={candidate.id} candidate={candidate} included={includedIds.includes(candidate.id)} onSelect={candidate=>{const next=new URLSearchParams(params);next.set('candidate',candidate.id);setParams(next)}}/>)}</ul>}
      <p className="workspace-footnote">Membership changes this comparison only. It is not a hiring decision and never deletes a supplied profile.</p>
    </div>{selected && <CandidateFullProfile key={selected.id} candidate={selected} onClose={close} />}</div>
  </section>
}
