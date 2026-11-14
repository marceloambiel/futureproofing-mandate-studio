import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { RiMapPinLine, RiMailLine, RiPhoneLine } from '@remixicon/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { CandidateAvatar } from './CandidateProfile'
import { ProfileExperience, ProfileEducation, ProfileProjects, ProfileSkillMap } from './CandidateProfileTabs'
import { candidateDirectory } from '@/domain/candidate-directory'
import type { ComparisonCriterion } from '@/domain/comparison-sources'
import type { Candidate } from '@/domain/model'

const tabs=[['experience','Experience'],['education','Education'],['projects','Projects'],['skill-map','Skill Map']] as const
type ProfileTab=typeof tabs[number][0]

export function CandidateFullProfile({candidate,onClose,source}:{candidate:Candidate;onClose:()=>void;source?:ComparisonCriterion}) {
  const profile=candidateDirectory[candidate.id]
  const [returnFocus]=useState(()=>document.activeElement instanceof HTMLElement?document.activeElement:null)
  const [active,setActive]=useState<ProfileTab>('experience')
  const pane=useRef<HTMLDivElement>(null)
  const tabRefs=useRef(new Map<ProfileTab,HTMLButtonElement>())
  const prefix=useId()
  useLayoutEffect(()=>{if(pane.current)pane.current.scrollTop=0},[active])
  function navigateTabs(event:KeyboardEvent<HTMLButtonElement>,index:number) {
    let next:number
    if(event.key==='ArrowRight')next=(index+1)%tabs.length
    else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length
    else if(event.key==='Home')next=0
    else if(event.key==='End')next=tabs.length-1
    else return
    event.preventDefault()
    const id=tabs[next][0]
    setActive(id)
    tabRefs.current.get(id)?.focus()
  }
  function focusSource(){
    const popup=pane.current?.closest('[role=dialog]')
    const target=popup?.querySelector<HTMLElement>('[data-comparison-focus=true]')
    if(!target)return
    if(pane.current?.contains(target))pane.current.scrollTop+=target.getBoundingClientRect().top-pane.current.getBoundingClientRect().top-24
    target.focus({preventScroll:true})
  }
  return <Dialog open onOpenChangeComplete={open=>{if(open&&source)focusSource()}} onOpenChange={open=>{if(!open)onClose()}}>
    <DialogContent className="workspace-dialog candidate-full-modal" finalFocus={()=>returnFocus?.isConnected?returnFocus:document.querySelector<HTMLButtonElement>('.candidate-add-trigger')}>
      <DialogHeader className="candidate-full-header"><CandidateAvatar id={candidate.id}/><div><DialogTitle>{candidate.name}</DialogTitle><DialogDescription>{profile.title} · {profile.employer}</DialogDescription><div className="candidate-full-contact"><span className={source==='location'?'profile-source-focus':undefined} data-comparison-focus={source==='location'||undefined} tabIndex={source==='location'?-1:undefined}><RiMapPinLine aria-hidden="true"/>{profile.location}</span><a href={`mailto:${profile.email}`}><RiMailLine aria-hidden="true"/>{profile.email}</a><a href={`tel:${profile.phone.replace(/[^+0-9]/g,'')}`}><RiPhoneLine aria-hidden="true"/>{profile.phone}</a><span className={source==='availability'?'profile-source-focus':undefined} data-comparison-focus={source==='availability'||undefined} tabIndex={source==='availability'?-1:undefined}>Available in {candidate.availabilityDays} days</span></div></div></DialogHeader>
      <div className="candidate-profile-nav" role="tablist" aria-label="Profile sections">{tabs.map(([id,label],index)=><button key={id} ref={node=>{if(node)tabRefs.current.set(id,node);else tabRefs.current.delete(id)}} type="button" role="tab" id={`${prefix}-tab-${id}`} tabIndex={active===id?0:-1} aria-selected={active===id} aria-controls={`${prefix}-panel-${id}`} onClick={()=>setActive(id)} onKeyDown={event=>navigateTabs(event,index)}>{label}</button>)}</div>
      <div className="candidate-full-content candidate-profile-scroll" ref={pane} role="tabpanel" id={`${prefix}-panel-${active}`} aria-labelledby={`${prefix}-tab-${active}`} tabIndex={0}>
        {active==='experience'&&<ProfileExperience candidate={candidate} source={source}/>}
        {active==='education'&&<ProfileEducation candidate={candidate}/>}
        {active==='projects'&&<ProfileProjects candidate={candidate}/>}
        {active==='skill-map'&&<ProfileSkillMap candidate={candidate}/>}
      </div>
    </DialogContent>
  </Dialog>
}
