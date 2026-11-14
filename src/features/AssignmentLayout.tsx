import { MobileAssignmentPager } from '@/components/workspace/MobileAssignmentPager'
import { Assignment } from './Assignment'
import { Candidates } from './Candidates'
import { Discussion } from './Discussion'
import { useMobileLayout } from '@/hooks/use-mobile-layout'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { RiCheckLine, RiArrowDownSLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'
import { FieldHistory } from '@/components/workspace/FieldHistory'
import { getAssignmentChanges, sampleAssignment, clientBriefDocuments } from '@/domain/v2'
import { useWorkspaceV2 } from '@/state/WorkspaceV2Provider'
import { AssignmentFlowProvider, useAssignmentFlow } from '@/state/AssignmentFlowProvider'
import { assignmentStageIndex } from '@/domain/assignment-flow'
import { AssignmentGeneration } from '@/components/workspace/AssignmentGeneration'
import { AssignmentUpdateToast } from '@/components/workspace/AssignmentUpdateToast'
import { getCurrent } from '@/domain/model'
import { useWorkspace } from '@/state/WorkspaceProvider'
import './assignment-steps.css'
import './workspace.css'
import './assignment.css'
import './assignment-workflow-layout.css'
import './assignment-mobile-overview.css'

export function AssignmentLayout(){return <AssignmentFlowProvider><AssignmentLayoutContent/></AssignmentFlowProvider>}

function AssignmentLayoutContent() {
  const flow=useAssignmentFlow()
  const location=useLocation()
  const mobile=useMobileLayout()
  const [contextOpen,setContextOpen]=useState(()=>location.pathname==='/workspace/assignment')
  const mobileOverview=mobile&&location.pathname==='/workspace/assignment'
  const completed=location.pathname==='/workspace/completed'
  const {state}=useWorkspace()
  const {assignmentDetails}=useWorkspaceV2()
  const currentBrief=getCurrent(state)
  const sent=currentBrief.status==='ready'&&(currentBrief.content.assignmentDetailsRevision??0)>=(assignmentDetails?.revision??0)
  const steps=[{label:'Overview',to:'/workspace/assignment',available:true,complete:flow.stage!=='overview',busy:false,detail:flow.stage!=='overview'?'Brief approved':'Review client brief'},{label:'Candidates',to:'/workspace/candidates',available:flow.candidatesAvailable,complete:assignmentStageIndex(flow.stage)>=assignmentStageIndex('drafting'),busy:flow.stage==='searching',detail:flow.stage==='searching'?'Finding candidates':assignmentStageIndex(flow.stage)>=assignmentStageIndex('drafting')?'Shortlist reviewed':'Review matches'},{label:'Discussion Brief',to:'/workspace/discussion',available:flow.discussionAvailable,complete:sent&&flow.stage==='discussion',busy:flow.stage==='drafting',detail:flow.stage==='drafting'?'Preparing document':sent&&flow.stage==='discussion'?'Sent for review':'Review and send'}]
  const {acknowledgedChangeIds,acknowledgeChange,markChangeViewed}=useWorkspaceV2()
  const headingRef=useRef<HTMLHeadingElement>(null)
  const stepsRef=useRef<HTMLElement>(null)
  const stepsStartRef=useRef<HTMLDivElement>(null)
  const [stepsStuck,setStepsStuck]=useState(false)
  useEffect(()=>{
    const start=stepsStartRef.current
    const scrollPane=start?.closest('.app-main')
    if(!start||!scrollPane)return
    const update=()=>setStepsStuck(start.getBoundingClientRect().top<scrollPane.getBoundingClientRect().top)
    update()
    scrollPane.addEventListener('scroll',update,{passive:true})
    window.addEventListener('resize',update)
    return ()=>{scrollPane.removeEventListener('scroll',update);window.removeEventListener('resize',update)}
  },[completed,location.pathname])
  useLayoutEffect(()=>{
    const nav=stepsRef.current
    if(!nav)return
    const update=()=>nav.closest<HTMLElement>('.assignment-layout')?.style.setProperty('--assignment-navigation-height',`${nav.getBoundingClientRect().height}px`)
    update()
    const observer=new ResizeObserver(update);observer.observe(nav)
    return ()=>observer.disconnect()
  },[completed])
  const event=getAssignmentChanges()[0]
  const eventId=event?.id
  useEffect(()=>{if(eventId)markChangeViewed(eventId)},[eventId,markChangeViewed])
  const unseen=event&&!acknowledgedChangeIds.includes(event.id)
  function dismissUpdate(){acknowledgeChange(event.id);headingRef.current?.focus()}
  const assignmentContext=<>
        <div className="assignment-ai-summary"><span className="assignment-summary-label">Assignment summary{clientBriefDocuments[0].summary!==clientBriefDocuments[1].summary&&<FieldHistory label="Assignment summary" valueFor={document=>document.summary}/>}</span><p>{clientBriefDocuments[0].summary}</p></div>
        <dl className="assignment-header-facts">
          <div><dt>Client</dt><dd>{assignmentDetails?.sections.company?.[0].values.company??'Northline Services Group'}</dd></div>
          <div><dt>Lead advisor</dt><dd>Caroline S.</dd></div>
          <div><dt>Role to fill</dt><dd>{assignmentDetails?.sections.role?.[0].values.role??'Head of Operations'}</dd></div>
        </dl>
  </>
  return <section className={mobileOverview?'workspace-page assignment-page assignment-layout assignment-layout--mobile-overview':'workspace-page assignment-page assignment-layout'}>
    {unseen&&location.pathname!=='/workspace/completed'&&<AssignmentUpdateToast key={event.id} onDismiss={dismissUpdate} onExpire={()=>acknowledgeChange(event.id)}/>}
    <aside className="assignment-general-info" aria-label="Assignment information"><header className="workspace-page-heading">
      {mobile?<details className="mobile-assignment-context" open={contextOpen} onToggle={event=>setContextOpen(event.currentTarget.open)}><summary><span className="assignment-summary-label assignment-title-label">Assignment</span><h1 ref={headingRef} tabIndex={-1}>{sampleAssignment.title}</h1><RiArrowDownSLine aria-hidden="true"/></summary>{assignmentContext}</details>:<div><span className="assignment-summary-label assignment-title-label">Assignment</span><h1 ref={headingRef} tabIndex={-1}>{sampleAssignment.title}</h1>{assignmentContext}</div>}
    </header></aside>
    <div className="assignment-workspace">
    {!completed&&<><div ref={stepsStartRef} className="assignment-steps-start" aria-hidden="true"/>{!mobile&&<nav ref={stepsRef} className={`assignment-steps ${stepsStuck?'is-stuck':''}`} aria-label="Assignment steps"><ol>{steps.map((step,index)=>{
      const active=location.pathname===step.to||(index===2&&location.pathname==='/workspace/completed')
      const content=<><span className={`assignment-step-marker ${step.complete?'is-complete':''} ${step.busy?'is-busy':''}`}>{step.complete?<RiCheckLine aria-hidden="true"/>:index+1}</span><span className="assignment-step-copy"><span>{step.label}</span><small>{step.detail}</small></span></>
      return <li key={step.to} className={step.available?'is-reached':undefined}>{step.available?<Link to={step.to} className={`assignment-step ${active?'is-active':''}`} aria-current={active?'step':undefined}>{content}</Link>:<button type="button" className="assignment-step" disabled title={`Complete ${index===1?'Overview':'Candidates'} first`}>{content}</button>}</li>
    })}</ol></nav>}</>}
    {mobile&&!completed&&((location.pathname==='/workspace/candidates'&&!flow.candidatesAvailable)||(location.pathname==='/workspace/discussion'&&!flow.discussionAvailable))?<Navigate to={flow.candidatesAvailable?'/workspace/candidates':'/workspace/assignment'} replace/>:mobile&&!completed?<MobileAssignmentPager steps={steps} pages={[<Assignment/>,flow.stage==='searching'?<AssignmentGeneration kind="candidates"/>:<Candidates/>,flow.stage==='drafting'?<AssignmentGeneration kind="discussion"/>:<Discussion/>]} navRef={stepsRef} stuck={stepsStuck}/>:location.pathname==='/workspace/candidates'&&!flow.candidatesAvailable?<Navigate to="/workspace/assignment" replace/>:location.pathname==='/workspace/discussion'&&!flow.discussionAvailable?<Navigate to={flow.candidatesAvailable?'/workspace/candidates':'/workspace/assignment'} replace/>:location.pathname==='/workspace/candidates'&&flow.stage==='searching'?<AssignmentGeneration kind="candidates"/>:location.pathname==='/workspace/discussion'&&flow.stage==='drafting'?<AssignmentGeneration kind="discussion"/>:<Outlet/>}
    {(location.pathname==='/workspace/candidates'&&flow.stage==='searching'||location.pathname==='/workspace/discussion'&&flow.stage==='drafting')&&<Button className="assignment-primary-action" disabled>{flow.stage==='searching'?'Finding candidates…':'Generating discussion brief…'}</Button>}
    </div>
  </section>
}
