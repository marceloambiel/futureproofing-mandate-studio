import { AssignmentStepHeader } from '@/components/workspace/AssignmentStepHeader'
import { useWorkspaceV2 } from '@/state/WorkspaceV2Provider'
import { useState } from 'react'
import { useMobileLayout } from '@/hooks/use-mobile-layout'
import { MobileDocumentPreview } from '@/components/workspace/MobileDocumentPreview'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { RiArrowRightLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { clientBriefDocuments } from '@/domain/v2'
import { ClientBriefDocument } from '@/components/workspace/ClientBriefDocument'
import { MandateVersions } from '@/components/workspace/MandateVersions'
import { candidates, getCurrent } from '@/domain/model'
import { useAssignmentFlow } from '@/state/AssignmentFlowProvider'
import { useWorkspace } from '@/state/WorkspaceProvider'
import { CandidateProfile } from '@/components/workspace/CandidateProfile'
import './workspace.css'
import './assignment.css'
import { AssignmentDetails } from './AssignmentDetails'

export function Assignment() {
  const activePage=useLocation().pathname==='/workspace/assignment'
  const {assignmentDetails}=useWorkspaceV2()
  const [reviewOpen,setReviewOpen]=useState(false)
  const mobile=useMobileLayout()
  const [documentOpen,setDocumentOpen]=useState(false)
  const { state } = useWorkspace()
  const flow=useAssignmentFlow()
  const current = getCurrent(state)
  const [params,setParams] = useSearchParams()
  const selected=activePage?candidates.find(candidate=>candidate.id===params.get('candidate')):undefined
  const closeProfile=()=>{const next=new URLSearchParams(params);next.delete('candidate');setParams(next)}

  if (params.has('assignment') && !['sample', 'head-of-operations'].includes(params.get('assignment')!)) return <section className="assignment-overview"><h1>Assignment not found</h1><p>We couldn’t find that sample assignment.</p><Link to="/workspace/assignment">Return to the sample assignment</Link></section>
  if(activePage&&params.has('candidate')&&!selected)return <section className="assignment-overview"><h1>Candidate not found</h1><p>This profile is not part of the supplied sample.</p><Link to="/workspace/assignment">Return to the sample assignment</Link></section>
  return <section className="assignment-overview">
    <AssignmentStepHeader title="Overview" task="Review the client brief and confirm the assignment details before matching candidates."/>
    {assignmentDetails?.requiresReview&&<div className="assignment-review-required" role="status"><strong>Fresh review required</strong><p>Assignment details were edited or restored. Review the updated sections before searching again. Previous candidates and briefs remain saved.</p></div>}
    <div className="assignment-document-layout"><section className="assignment-document-column" aria-labelledby="client-brief-title">
      <div className="assignment-mandate-heading"><h2 id="client-brief-title">Client Brief</h2><span className="notification-new-tag">NEW</span><MandateVersions/></div>
      {mobile?<MobileDocumentPreview label="Open full client brief" action="Read full document" onOpen={()=>setDocumentOpen(true)}><ClientBriefDocument document={clientBriefDocuments[0]}/></MobileDocumentPreview>:<div className="assignment-document-reader" role="region" aria-label="Current client brief document" tabIndex={0}><ClientBriefDocument document={clientBriefDocuments[0]}/></div>}
      {mobile&&<Dialog open={documentOpen} onOpenChange={setDocumentOpen}><DialogContent className="workspace-dialog mobile-document-dialog" aria-describedby={undefined}><DialogHeader><DialogTitle>Client brief</DialogTitle></DialogHeader><ClientBriefDocument document={clientBriefDocuments[0]}/></DialogContent></Dialog>}
      {current.content.alignment === 'expansion' && <p className="workspace-warning" role="status"><strong>Restored content reflects an outdated priority.</strong> The current board mandate remains integration. Update the discussion before marking it ready.</p>}
    </section>
    <AssignmentDetails mobileOptimized={mobile}/></div>
    {mobile?<div className="mobile-assignment-action-bar"><Button className="assignment-primary-action" onClick={()=>assignmentDetails?.requiresReview?setReviewOpen(true):flow.generateCandidates()}>{assignmentDetails?.requiresReview?'Review and match candidates':flow.stage==='overview'?'Match candidates to brief':flow.stage==='searching'?'View search progress':'Continue to candidates'}<RiArrowRightLine aria-hidden="true"/></Button></div>:<Button className="assignment-primary-action" onClick={()=>assignmentDetails?.requiresReview?setReviewOpen(true):flow.generateCandidates()}>{assignmentDetails?.requiresReview?'Review and match candidates':flow.stage==='overview'?'Match candidates to brief':flow.stage==='searching'?'View search progress':'Continue to candidates'}<RiArrowRightLine aria-hidden="true"/></Button>}
    <Dialog open={reviewOpen} onOpenChange={setReviewOpen}><DialogContent confirmation className="workspace-dialog"><DialogHeader><DialogTitle>Confirm updated assignment?</DialogTitle><DialogDescription>Confirm that Search, Role and Company details are correct. Candidates will be searched again, and the discussion brief will need a fresh review before it can be sent.</DialogDescription></DialogHeader><div className="assignment-detail-actions"><Button variant="outline" onClick={()=>setReviewOpen(false)}>Keep reviewing</Button><Button onClick={()=>{setReviewOpen(false);flow.generateCandidates()}}>Confirm and match candidates</Button></div></DialogContent></Dialog>
    {selected&&<CandidateProfile key={selected.id} candidate={selected} onClose={closeProfile} returnLabel="Back to assignment"/>}
  </section>
}
