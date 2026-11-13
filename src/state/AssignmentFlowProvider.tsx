import {postEmbeddedEvent} from '@/domain/embedded-workspace'
import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { assignmentStageIndex, generationDuration, type AssignmentStage } from '@/domain/assignment-flow'
import { clientBriefDocuments } from '@/domain/v2'
import { useWorkspaceV2 } from './WorkspaceV2Provider'

interface AssignmentFlow {
  stage:AssignmentStage
  candidatesAvailable:boolean
  discussionAvailable:boolean
  generateCandidates:()=>void
  generateDiscussion:()=>void
}
const FlowContext=createContext<AssignmentFlow|null>(null)
export function AssignmentFlowProvider({children}:{children:ReactNode}) {
  const {assignmentProgress,advanceAssignment,includedIds,assignmentDetails}=useWorkspaceV2()
  const navigate=useNavigate()
  const location=useLocation()
  const stage=assignmentDetails?.requiresReview?'overview':assignmentProgress?.briefVersion===clientBriefDocuments[0].version?assignmentProgress.stage:'overview'
  const candidatesAvailable=assignmentStageIndex(stage)>=assignmentStageIndex('searching')
  const discussionAvailable=assignmentStageIndex(stage)>=assignmentStageIndex('drafting')
  useEffect(()=>{
    const publish=()=>postEmbeddedEvent({kind:'flow',candidatesAvailable,discussionAvailable})
    publish()
    window.addEventListener('mandate:request-flow',publish)
    return ()=>window.removeEventListener('mandate:request-flow',publish)
  },[candidatesAvailable,discussionAvailable])
  useEffect(()=>{
    if(stage!=='searching'&&stage!=='drafting')return
    const timer=setTimeout(()=>advanceAssignment(stage==='searching'?'candidates':'discussion'),stage==='searching'?generationDuration.candidates:generationDuration.discussion)
    return ()=>clearTimeout(timer)
  },[stage,advanceAssignment])
  useEffect(()=>{
    if((stage==='candidates'&&location.pathname.endsWith('/candidates'))||(stage==='discussion'&&location.pathname.endsWith('/discussion'))){
      const frame=requestAnimationFrame(()=>(document.querySelector<HTMLElement>('.mobile-assignment-current-step')??Array.from(document.querySelectorAll<HTMLElement>('[data-step-result-heading]')).find(heading=>!heading.closest('[inert]')))?.focus({preventScroll:true}))
      return ()=>cancelAnimationFrame(frame)
    }
  },[stage,location.pathname])
  function generateCandidates(){if(stage==='overview')advanceAssignment('searching');navigate('/workspace/candidates')}
  function generateDiscussion(){if(!includedIds.length||!candidatesAvailable||stage==='searching')return;if(stage==='candidates')advanceAssignment('drafting');navigate('/workspace/discussion')}
  return <FlowContext.Provider value={{stage,candidatesAvailable,discussionAvailable,generateCandidates,generateDiscussion}}>{children}</FlowContext.Provider>
}
export function useAssignmentFlow(){
  const context=useContext(FlowContext)
  if(!context)throw new Error('Assignment steps need an AssignmentFlowProvider.')
  return context
}
