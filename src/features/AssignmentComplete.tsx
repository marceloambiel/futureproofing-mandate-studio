import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { RiCheckLine, RiArrowRightLine, RiRestartLine } from '@remixicon/react'
import { getCurrent } from '@/domain/model'
import { sampleAssignment } from '@/domain/v2'
import { useWorkspace } from '@/state/WorkspaceProvider'
import { useWorkspaceV2 } from '@/state/WorkspaceV2Provider'
import { Button } from '@/components/ui/button'
import './assignment-complete.css'

export function AssignmentComplete(){
 const {state,session}=useWorkspace()
 const navigate=useNavigate()
 const [restartFailed,setRestartFailed]=useState(false)
 const [restarting,setRestarting]=useState(false)
 const preferences=useWorkspaceV2()
 const {includedIds,assignmentDetails}=preferences
 function restart(){setRestarting(true);if(session.reset()){preferences.reset();navigate('/workspace',{replace:true})}else{setRestarting(false);setRestartFailed(true)}}
 const current=getCurrent(state)
 const heading=useRef<HTMLHeadingElement>(null)
 useEffect(()=>{heading.current?.focus({preventScroll:true})},[])
 if(!restarting&&(current.status!=='ready'||assignmentDetails?.requiresReview||(current.content.assignmentDetailsRevision??0)<(assignmentDetails?.revision??0)))return <Navigate to="/workspace/assignment" replace/>
 return <section className="assignment-complete" aria-labelledby="assignment-complete-title">
  <span className="assignment-complete-icon" aria-hidden="true"><RiCheckLine/></span>
  <h2 id="assignment-complete-title" ref={heading} tabIndex={-1}>Assignment completed</h2>
  <p>The discussion brief is ready for manager review.<br/>Your preparation for {sampleAssignment.title} is complete.</p>
  <dl><div><dt>Client brief</dt><dd>Reviewed</dd></div><div><dt>Candidates</dt><dd>{includedIds.length} selected</dd></div><div><dt>Discussion brief</dt><dd>Sent for review · Version {current.sequence}</dd></div></dl>
  <div className="assignment-complete-actions"><Button render={<Link to="/?conversation=1"/>}>Request a conversation<RiArrowRightLine aria-hidden="true"/></Button><Button variant="outline" onClick={restart}><RiRestartLine aria-hidden="true"/>Restart demo</Button><Link className="assignment-complete-review" to="/workspace/discussion">View submitted assignment</Link></div>
  {restartFailed&&<p className="assignment-restart-error" role="alert">The demo couldn’t be restarted. Your submitted assignment is still saved. Try again.</p>}
 </section>
}
