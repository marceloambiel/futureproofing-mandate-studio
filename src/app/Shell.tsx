import {useEmbeddedWorkspace} from '@/hooks/use-embedded-workspace'
import {useAssignmentSubmitted} from '@/hooks/use-assignment-submitted'
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { RiBriefcaseLine, RiGroupLine, RiArrowLeftLine, RiArrowRightLine, RiHomeLine, RiMenuLine } from '@remixicon/react'
import { Notifications } from '@/components/workspace/Notifications'
import { RecoveryNotice, ResetSample } from '@/components/workspace/RecoveryNotice'
import { useWorkspaceV2 } from '@/state/WorkspaceV2Provider'
import { getAssignmentChanges, sampleAssignment } from '@/domain/v2'
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet'
import './shell-frame.css'

export function Shell(){
 useEmbeddedWorkspace()
 const [menuOpen,setMenuOpen]=useState(false)
 useEffect(()=>{
  const desktop=window.matchMedia('(min-width:801px)')
  const closeOnDesktop=()=>{if(desktop.matches)setMenuOpen(false)}
  desktop.addEventListener('change',closeOnDesktop)
  return ()=>desktop.removeEventListener('change',closeOnDesktop)
 },[])
 const topbarRef=useRef<HTMLElement>(null)
 const mainRef=useRef<HTMLDivElement>(null)
 useLayoutEffect(()=>{
  const header=topbarRef.current
  if(!header)return
  const update=()=>{const height=`${header.getBoundingClientRect().height}px`;header.parentElement?.style.setProperty('--workspace-topbar-height',height);header.parentElement?.style.setProperty('--shell-navbar-height',height)}
  update()
  const observer=new ResizeObserver(update)
  observer.observe(header)
  return ()=>observer.disconnect()
 },[])
 const navigate=useNavigate()
 const preferences=useWorkspaceV2()
 const submitted=useAssignmentSubmitted()
 const hasAssignmentUpdate=getAssignmentChanges().some(change=>!preferences.acknowledgedChangeIds.includes(change.id)&&!preferences.viewedChangeIds.includes(change.id))
 const location=useLocation()
 const view=location.pathname.split('/').at(-1)
 const active=view==='candidates'?'Candidates':(view==='discussion'||view==='completed')?'Discussion brief':view==='experts'?'Experts':view==='assignment'?'Overview':'Home'
 const assignment=['Overview','Candidates','Discussion brief'].includes(active)
 useLayoutEffect(()=>{mainRef.current?.scrollTo({top:0,behavior:'instant'})},[location.pathname])
 const railContent=<><Link to="/" className="brand-link" aria-label="Mandate Studio homepage"><img src="/brand/mandate-studio.svg" alt="Mandate Studio" width="182" height="23"/><img className="compact-logo" src="/brand/mandate-studio-icon.svg" alt="" width="35" height="21"/></Link>
 <nav className="app-nav" aria-label="Workspace"><NavLink end to="/workspace" aria-label="Home" title="Home" className={({isActive})=>isActive||location.pathname==='/workspace/home'?'active':undefined}><RiHomeLine aria-hidden="true"/><span className="dark-rail-nav-label">Home</span></NavLink><NavLink to="/workspace/assignment" aria-label="Assignments" title="Assignments" className={()=>assignment?'active':undefined}><RiBriefcaseLine aria-hidden="true"/><span className="dark-rail-nav-label">Assignments</span>{!submitted&&<span className="assignment-count" aria-label="1 active assignment">1</span>}{hasAssignmentUpdate&&<span className="assignment-update-dot" role="img" aria-label="New mandate update"/>}</NavLink><NavLink to="/workspace/experts" aria-label="Experts" title="Experts"><RiGroupLine aria-hidden="true"/><span className="dark-rail-nav-label">Experts</span></NavLink></nav>
 <div className="rail-bottom"><ResetSample demo label="Reset" className="rail-reset-demo" onReset={()=>{setMenuOpen(false);requestAnimationFrame(()=>navigate('/workspace',{replace:true}))}}/><Link to="/" title="Back to website" aria-label="Back to website"><RiArrowLeftLine aria-hidden="true"/><span className="dark-rail-link-label">Website</span></Link><div className="consultant-identity rail-profile" title="Caroline S. · Executive search advisor"><span className="consultant-headshot" role="img" aria-label="Caroline S., executive search advisor"/><div className="consultant-copy"><strong>Caroline S.</strong><span>Executive search advisor</span></div></div></div></>
 return <div className="app-shell app-shell--dark"><a className="skip-link" href="#main">Skip to content</a><aside className="app-rail" aria-label="Workspace navigation">{railContent}</aside>
 <header ref={topbarRef} className="workspace-topbar"><div className="topbar-navigation"><Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetTrigger className="mobile-menu-trigger" aria-label="Open navigation menu" render={<button type="button"/>}><RiMenuLine aria-hidden="true"/></SheetTrigger><SheetContent side="left" className="mobile-navigation-drawer app-shell--dark" aria-describedby={undefined}><SheetTitle className="sr-only">Navigation menu</SheetTitle><aside className="app-rail" aria-label="Mobile workspace navigation" onClick={event=>{if((event.target as HTMLElement).closest('a[href]'))setMenuOpen(false)}}>{railContent}</aside></SheetContent></Sheet><div className="history-controls" role="group" aria-label="Page history"><button type="button" aria-label="Go back" onClick={()=>navigate(-1)}><RiArrowLeftLine aria-hidden="true"/></button><button type="button" aria-label="Go forward" onClick={()=>navigate(1)}><RiArrowRightLine aria-hidden="true"/></button></div><span className="topbar-divider" aria-hidden="true"/><nav aria-label="Breadcrumb">{assignment?<><Link to="/workspace/assignment">Assignments</Link><span aria-hidden="true">/</span><Link aria-current="page" to="/workspace/assignment">{sampleAssignment.title}</Link></>:<Link aria-current="page" to={location.pathname}>{active}</Link>}</nav></div><Link className="mobile-topbar-brand" to="/workspace" aria-label="Mandate Studio home"><img src="/brand/mandate-studio.svg" alt="Mandate Studio" width="154" height="20"/></Link><div className="topbar-actions"><Notifications unread={hasAssignmentUpdate}/><div className="consultant-identity shell-topbar-profile" title="Caroline S. · Executive search advisor"><span className="consultant-headshot" role="img" aria-label="Caroline S., executive search advisor"/></div></div></header><div ref={mainRef} className="app-main"><main id="main" className="workspace-main"><RecoveryNotice/>{preferences.persistence==='memory'&&<p className="workspace-warning" role="status">Comparison and acknowledgement choices stay in this session only. Browser preferences could not be loaded or saved. <Link to="/prototype-notes">Review recovery options</Link></p>}<Outlet/>{active==='Home'&&<footer className="workspace-home-footer"><p>Application designed by Marcelo Ambiel for FutureProofing.</p></footer>}</main></div></div>
}
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
