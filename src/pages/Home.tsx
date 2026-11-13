import {FinalConversation} from './homepage/FinalConversation'
import {InteractiveDemo} from './homepage/InteractiveDemo'
import {TechnologyJudgment} from './homepage/TechnologyJudgment'
import {OurApproach} from './homepage/OurApproach'
import {ProductValue} from './homepage/ProductValue'
import {MarketingHeroVideo} from '@/components/MarketingHeroVideo'
import {useEffect,useRef,useState} from 'react'
import {Link,useSearchParams} from 'react-router-dom'
import {RiMenuLine,RiCloseLine,RiArrowRightLine,RiBuildingLine,RiGitMergeLine,RiRouteLine,RiFileTextLine,RiGroupLine,RiQuestionLine} from '@remixicon/react'
import {Button} from '@/components/ui/button'
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogHeader,DialogFooter} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import './marketing-v2.css'
import './homepage/homepage.css'

export function Home(){
 const [searchParams,setSearchParams]=useSearchParams()
 const [open,setOpen]=useState(()=>searchParams.get('conversation')==='1'),[sent,setSent]=useState(false)
 function changeEnquiryOpen(value:boolean){setOpen(value);if(!value&&searchParams.has('conversation')){const next=new URLSearchParams(searchParams);next.delete('conversation');setSearchParams(next,{replace:true})}}
 const mobileNavigation=useRef<HTMLDetailsElement>(null)
 useEffect(()=>{
  const dismiss=(event:PointerEvent)=>{const menu=mobileNavigation.current;if(menu?.open&&!menu.contains(event.target as Node))menu.open=false}
  document.addEventListener('pointerdown',dismiss)
  return ()=>document.removeEventListener('pointerdown',dismiss)
 },[])
 function closeNavigation(){if(mobileNavigation.current)mobileNavigation.current.open=false}

 const [values,setValues]=useState({name:'',email:'',need:''})
 const [errors,setErrors]=useState<Record<string,string>>({})
 const nameRef=useRef<HTMLInputElement>(null),emailRef=useRef<HTMLInputElement>(null),needRef=useRef<HTMLTextAreaElement>(null)
 function submit(e:React.FormEvent){e.preventDefault();const next:Record<string,string>={};if(!values.name.trim())next.name='Enter your name.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))next.email='Enter a valid work email.';if(!values.need.trim())next.need='Describe your leadership need.';setErrors(next);if(Object.keys(next).length){(next.name?nameRef:next.email?emailRef:needRef).current?.focus();return}setSent(true)}
 function request(){setSent(false);setErrors({});setOpen(true)}
 return <div className="marketing marketing-v2 mandate-home"><a className="skip-link" href="#main">Skip to content</a><header className="site-header"><Link to="/" aria-label="Mandate homepage"><img src="/brand/mandate.svg" alt="Mandate" width="141" height="26"/></Link><nav aria-label="Main navigation"><a href="#challenges">Leadership challenges</a><a href="#our-process">Our approach</a><a href="#sample-workspace">Mandate Studio</a></nav><Button className="marketing-header-cta" variant="outline" onClick={request}>Request a conversation</Button><details ref={mobileNavigation} className="marketing-mobile-navigation" onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();closeNavigation();mobileNavigation.current?.querySelector('summary')?.focus()}}}><summary aria-label="Toggle navigation"><RiMenuLine className="menu-open-icon" aria-hidden="true"/><RiCloseLine className="menu-close-icon" aria-hidden="true"/></summary><div className="marketing-mobile-navigation-panel"><nav aria-label="Mobile main navigation"><a href="#challenges" onClick={closeNavigation}>Leadership challenges</a><a href="#our-process" onClick={closeNavigation}>Our approach</a><a href="#sample-workspace" onClick={closeNavigation}>Mandate Studio</a></nav><Button onClick={()=>{closeNavigation();request()}}>Request a conversation</Button></div></details></header>
 <main id="main"><section className="mandate-hero" aria-labelledby="homepage-hero-title"><MarketingHeroVideo/><div className="mandate-hero-content"><p className="eyebrow">Executive search for consequential leadership</p><h1 id="homepage-hero-title"><span>The business has changed.</span>{' '}<span>What should its next leader bring?</span></h1><p>Acquisitions, a growing footprint, a new direction. Start with the leadership question, then examine the experience it calls for.</p><div className="mandate-hero-actions"><Button size="lg" onClick={request}>Request a conversation<RiArrowRightLine aria-hidden="true"/></Button><a href="#sample-workspace">Explore sample workspace<RiArrowRightLine aria-hidden="true"/></a></div><small>A fictional advisory firm. A working example of a considered search.</small></div></section>


 <section id="challenges" className="mandate-marketing-section"><div className="marketing-section-title centered"><p className="eyebrow">Leadership challenges</p><h2>The same title can call for different experience.</h2><p>Define the work the next leader must do, rather than relying on a familiar job title.</p></div><div className="leadership-capabilities"><article><RiGitMergeLine aria-hidden="true"/><h3>Integrating acquisitions</h3><p>Clarify who personally led the integration work and what their responsibility involved.</p></article><article><RiBuildingLine aria-hidden="true"/><h3>Leading across locations</h3><p>Understand the operating scale behind the experience and the decisions the leader owned.</p></article><article><RiRouteLine aria-hidden="true"/><h3>Preparing for expansion</h3><p>Distinguish helping a business grow from taking responsibility for its next stage.</p></article><article><RiGroupLine aria-hidden="true"/><h3>Comparing experience</h3><p>Assess every profile against the same business need, with room for different trade-offs.</p></article><article><RiQuestionLine aria-hidden="true"/><h3>Investigating unknowns</h3><p>Turn missing evidence into specific questions before making a recommendation.</p></article><article><RiFileTextLine aria-hidden="true"/><h3>Reviewing the current brief</h3><p>Keep the latest mandate and its review status clear when earlier content changes.</p></article></div></section>
 <ProductValue/>
 <OurApproach/>
 <TechnologyJudgment/>
 <InteractiveDemo onRequestConversation={request}/>


 <FinalConversation onRequestConversation={request}/></main>
 <footer className="site-footer homepage-footer" data-nav-theme="light"><div className="homepage-container"><div className="homepage-footer-main"><Link to="/" aria-label="Mandate homepage"><img src="/brand/mandate.svg" alt="Mandate" width="141" height="26"/></Link><nav aria-label="Footer navigation"><a href="#challenges">Leadership challenges</a><a href="#our-process">Our approach</a><a href="#sample-workspace">Mandate Studio</a><button type="button" onClick={request}>Request a conversation</button></nav></div><div className="homepage-footer-meta"><p>Mandate is a fictional prototype. Workspace records are sample data; no inquiries or review documents are delivered.</p><div><Link to="/prototype-notes">Prototype notes</Link><Link to="/process">Design process</Link></div></div></div></footer>
 <Dialog open={open} onOpenChange={changeEnquiryOpen}><DialogContent className="enquiry-dialog"><DialogHeader><DialogTitle>{sent?'Contact preview only':'Request a conversation'}</DialogTitle><DialogDescription>{sent?'No inquiry was sent or saved. This prototype has no live contact service.':'Prototype contact form. Use sample information only; nothing will be sent or saved.'}</DialogDescription></DialogHeader>{sent?<><p className="homepage-contact-preview">This is a preview of the contact experience. A live inquiry destination is not configured.</p><DialogFooter><Button onClick={()=>changeEnquiryOpen(false)}>Close</Button></DialogFooter></>:<form onSubmit={submit} noValidate><div className="field"><label htmlFor="enquiry-name">Name</label><Input ref={nameRef} id="enquiry-name" autoComplete="name" value={values.name} onChange={e=>setValues({...values,name:e.target.value})} aria-invalid={!!errors.name} aria-describedby={errors.name?'error-name':undefined}/>{errors.name&&<p id="error-name" className="field-error">{errors.name}</p>}</div><div className="field"><label htmlFor="enquiry-email">Work email</label><Input ref={emailRef} type="email" id="enquiry-email" autoComplete="email" value={values.email} onChange={e=>setValues({...values,email:e.target.value})} aria-invalid={!!errors.email} aria-describedby={errors.email?'error-email':undefined}/>{errors.email&&<p id="error-email" className="field-error">{errors.email}</p>}</div><div className="field"><label htmlFor="enquiry-need">Leadership need</label><Textarea ref={needRef} id="enquiry-need" value={values.need} onChange={e=>setValues({...values,need:e.target.value})} aria-invalid={!!errors.need} aria-describedby={errors.need?'error-need':undefined}/>{errors.need&&<p id="error-need" className="field-error">{errors.need}</p>}</div>{Object.keys(errors).length>0&&<p role="alert" className="field-error">Check the highlighted fields.</p>}<DialogFooter><Button variant="outline" type="button" onClick={()=>changeEnquiryOpen(false)}>Cancel</Button><Button type="submit">Preview contact request</Button></DialogFooter></form>}</DialogContent></Dialog>
 </div>
}
