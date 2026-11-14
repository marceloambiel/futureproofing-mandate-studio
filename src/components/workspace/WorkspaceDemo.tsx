import {RiPlayFill} from '@remixicon/react'
import {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import './workspace-demo.css'

// The preview leads to the existing app; it never owns assignment state.
export function WorkspaceDemo(){
 const section=useRef<HTMLDivElement>(null)
 const host=useRef<HTMLDivElement>(null)
 const backdrop=useRef<HTMLDivElement>(null)
 const backgroundOrigin=useRef<DOMRect | null>(null)
 const entry=useRef<HTMLAnchorElement>(null)
 const origin=useRef<DOMRect | null>(null)
 const [opening,setOpening]=useState(false)
 const [previewHeight,setPreviewHeight]=useState(0)
 const navigate=useNavigate()
 useEffect(()=>{if(window.location.hash==='#sample-workspace')section.current?.closest('#sample-workspace')?.scrollIntoView({block:'start',behavior:'instant'})},[])
 useLayoutEffect(()=>{
  if(!opening || !host.current || !origin.current)return
  const frame=host.current, viewport=frame.querySelector('.demo-frame-viewport')!, rect=origin.current
  const width=window.innerWidth,height=window.innerHeight
  const transform=(x:number,y:number,w:number,h:number)=>`translate(${x}px, ${y}px) scale(${w/width}, ${h/height})`
  const initial=transform(rect.left,rect.top,rect.width,rect.height)
  const stageWidth=Math.min(width-24,rect.width*1.08),stageHeight=Math.min(height-24,rect.height*1.08)
  const intermediate=transform((width-stageWidth)/2,(height-stageHeight)/2,stageWidth,stageHeight)
  const previousOverflow=document.body.style.overflow
  document.body.style.overflow='hidden'
  const options:KeyframeAnimationOptions={duration:2000,fill:'forwards'}
  const easing='cubic-bezier(0.77, 0, 0.175, 1)'
  const backgroundRect=backgroundOrigin.current!
  const backgroundExpansion=backdrop.current!.animate([
   {transform:transform(backgroundRect.left,backgroundRect.top,backgroundRect.width,backgroundRect.height),borderRadius:'8px',offset:0,easing},
   {transform:'translate(0px, 0px) scale(1, 1)',borderRadius:'0px',offset:.35},
   {transform:'translate(0px, 0px) scale(1, 1)',borderRadius:'0px',offset:1},
  ],options)
  const expansion=frame.animate([
   {transform:initial,borderRadius:'8px',offset:0,easing},
   {transform:intermediate,borderRadius:'8px',offset:.35},
   {transform:intermediate,borderRadius:'8px',offset:.6,easing},
   {transform:'translate(0px, 0px) scale(1, 1)',borderRadius:'0px',offset:1},
  ],options)
  const clarity=viewport.animate([
   {filter:'grayscale(1) blur(3px)',offset:0,easing},
   {filter:'grayscale(.8) blur(2px)',offset:.35},
   {filter:'grayscale(.8) blur(2px)',offset:.6,easing},
   {filter:'grayscale(0) blur(0px)',offset:1},
  ],options)
  let cancelled=false
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpening(false);requestAnimationFrame(()=>entry.current?.focus())}}
  window.addEventListener('keydown',escape)
  void expansion.finished.then(()=>{if(!cancelled)navigate('/workspace?restart=1')}).catch(()=>{})
  return ()=>{cancelled=true;expansion.cancel();clarity.cancel();backgroundExpansion.cancel();document.body.style.overflow=previousOverflow;window.removeEventListener('keydown',escape)}
 },[opening,navigate])
 return <div ref={section} className="workspace-demo" data-opening={opening || undefined}>
  <div className="demo-preview-container">{opening&&<div ref={backdrop} className="demo-expanding-background" aria-hidden="true"/>}<div className="demo-frame-placeholder" style={opening?{height:previewHeight}:undefined}><div ref={host} className="demo-frame-host">
   <div className="demo-preview-stage">
    <div className="demo-frame-viewport" inert aria-hidden="true"><iframe src="/workspace?preview=1" title="Mandate Studio dashboard preview" tabIndex={-1} loading="lazy"/></div>
    <Link ref={entry} to="/workspace?restart=1" className="demo-preview-entry" aria-busy={opening} onClick={event=>{
     if(event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return
     if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return
     event.preventDefault()
     if(opening)return
     origin.current=host.current!.getBoundingClientRect()
     backgroundOrigin.current=host.current!.closest('.demo-preview-container')!.getBoundingClientRect()
     setPreviewHeight(origin.current.height)
     setOpening(true)
    }}><span className="demo-start-notice"><RiPlayFill aria-hidden="true"/>{opening?'Opening the demo…':'Start the demo'}</span></Link>
   </div>
  </div></div></div>
  <span className="sr-only" role="status">{opening?'Opening Mandate Studio. Press Escape to cancel.':''}</span>
 </div>
}
