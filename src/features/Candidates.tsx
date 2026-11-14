import { AssignmentStepHeader } from '@/components/workspace/AssignmentStepHeader'
import { useId } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { RiArrowRightLine } from '@remixicon/react'
import { candidates, mandate, type Candidate } from '@/domain/model'
import { Button } from '@/components/ui/button'
import { useAssignmentFlow } from '@/state/AssignmentFlowProvider'
import { useWorkspaceV2 } from '@/state/WorkspaceV2Provider'
import { CandidateFullProfile } from '@/components/workspace/CandidateFullProfile'
import { ComparisonSource } from '@/components/workspace/ComparisonSource'
import { candidateDirectory } from '@/domain/candidate-directory'
import { comparisonCriteria, getComparisonStatus } from '@/domain/comparison'
import type { ComparisonCriterion } from '@/domain/comparison-sources'
import { IncludedProfiles } from './IncludedProfiles'
import './workspace.css'
import './v2-candidates.css'

const comparisonEvidence = {
  A: {integration:'Not yet established',scale:'Expanded from 4 to 12 locations'},
  B: {integration:'Led 2 acquisition integrations',scale:'12-location responsibility needs clarification'},
  C: {integration:'Candidate-described; scope unverified',scale:'Operating scale not supplied'},
} as const

const statusLabels={match:'Match',attention:'To confirm',unmet:'Not met',neutral:'Not provided'}
function ComparisonValue({candidate,criterion}:{candidate:Candidate;criterion:ComparisonCriterion}) {
  return <span className="comparison-value">{criterion==='availability'?`${candidate.availabilityDays} days`:criterion==='location'?candidateDirectory[candidate.id].location:comparisonEvidence[candidate.id][criterion]}</span>
}

export function ComparisonTable({onSelect}:{onSelect:(candidate:Candidate,source?:ComparisonCriterion)=>void}) {
  const {includedIds}=useWorkspaceV2()
  const prefix=useId()
  const included=candidates.filter(candidate=>includedIds.includes(candidate.id))
  const rows=comparisonCriteria
  if(!included.length)return <p className="workspace-muted">Add candidates above to compare their experience.</p>
  return <Tooltip.Provider delay={200}><div className="v2-comparison v2-comparison-simple"><div className="v2-comparison-table-wrap" role="region" aria-label="Candidate comparison" tabIndex={0}><div className="comparison-table-track"><table className="v2-comparison-table">
    <caption className="sr-only">Selected candidates against the client brief. Unverified experience and missing information remain explicit.</caption>
    <thead><tr><th scope="col" className="v2-criterion-header"><span className="sr-only">Role criteria</span></th>{included.map(candidate=><th scope="col" id={`${prefix}-candidate-${candidate.id}`} key={candidate.id}><button className="comparison-profile-link" type="button" onClick={()=>onSelect(candidate)}>{candidate.name}</button></th>)}</tr></thead>
    <tbody>{rows.map(row=><tr key={row.id}><th scope="row" id={`${prefix}-criterion-${row.id}`}>{row.label}{row.id==='availability'&&<small>Within {mandate.startWithinDays} days</small>}{row.id==='location'&&<small>Chicago · site travel</small>}</th>{included.map(candidate=><td key={candidate.id} headers={`${prefix}-candidate-${candidate.id} ${prefix}-criterion-${row.id}`}><span className={`comparison-status-tag comparison-status-${getComparisonStatus(candidate,row.id)}`}>{statusLabels[getComparisonStatus(candidate,row.id)]}</span><ComparisonValue candidate={candidate} criterion={row.id}/><div className="comparison-cell-meta"><ComparisonSource candidate={candidate} criterion={row.id} onOpen={()=>onSelect(candidate,row.id)}/></div></td>)}</tr>)}</tbody>
  </table></div></div></div></Tooltip.Provider>
}

export function Candidates() {
  const activePage=useLocation().pathname==='/workspace/candidates'
  const flow=useAssignmentFlow()
  const {includedIds}=useWorkspaceV2()
  const [params, setParams] = useSearchParams()
  const candidateId = params.get('candidate')
  const selected = activePage?candidates.find(candidate => candidate.id === candidateId):undefined
  const close = () => { const next = new URLSearchParams(params); next.delete('candidate'); next.delete('source'); setParams(next) }
  const select = (candidate: Candidate, source?:ComparisonCriterion) => { const next = new URLSearchParams(params); next.set('candidate', candidate.id); if(source)next.set('source',source);else next.delete('source'); setParams(next) }
  const sourceParam=params.get('source')
  const source=sourceParam==='integration'||sourceParam==='scale'||sourceParam==='availability'||sourceParam==='location'?sourceParam:undefined
  if (activePage && candidateId && !selected) return <section className="workspace-page"><h1>Candidate not found</h1><p>We couldn’t find that candidate in this sample assignment.</p><Link to="/workspace/candidates">Return to candidate comparison</Link></section>
  return <section className="workspace-page workspace-comparison-page">
    <AssignmentStepHeader title="Candidates" task="Review the matching profiles and refine your shortlist before generating the discussion brief."/>
    <IncludedProfiles onSelect={select}/>
    <header id="candidate-comparison" className="workspace-page-heading"><div><h2>Candidate comparison</h2></div></header>
    <div className="v2-comparison-layout"><div className="v2-comparison-context"><ComparisonTable onSelect={select} />
      <div className="mobile-assignment-action-bar"><Button className="assignment-primary-action" onClick={flow.generateDiscussion} disabled={!includedIds.length}>{flow.stage==='drafting'?'View generation progress':flow.discussionAvailable?'Continue to discussion brief':'Prepare Discussion Brief'}<RiArrowRightLine aria-hidden="true"/></Button></div>
    </div>{selected && <CandidateFullProfile key={`${selected.id}-${source??'profile'}`} candidate={selected} source={source} onClose={close} />}</div>
  </section>
}
