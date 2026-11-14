import {useHomepageSmoothScroll} from './homepage/use-homepage-smooth-scroll'
import {useHomepageReveals} from './homepage/use-homepage-reveals'
import {SignInPreview} from './homepage/SignInPreview'
import {Faq} from './homepage/Faq'
import {FinalConversation} from './homepage/FinalConversation'
import {InteractiveDemo} from './homepage/InteractiveDemo'
import {TechnologyJudgment} from './homepage/TechnologyJudgment'
import {OurApproach} from './homepage/OurApproach'
import {useHomepageNavbarTheme} from './homepage/use-homepage-navbar-theme'
import {ProductValue} from './homepage/ProductValue'
import {LeadershipChallenges} from './homepage/HomepageShowcases'
import {MarketingHeroVideo} from '@/components/MarketingHeroVideo'
import {useEffect,useRef,useState} from 'react'
import {Link,useSearchParams} from 'react-router-dom'
import {RiMenuLine,RiCloseLine,RiArrowRightLine} from '@remixicon/react'
import {Button} from '@/components/ui/button'
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogHeader,DialogFooter} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import './marketing-v2.css'
import './homepage/homepage.css'
import './homepage/micro-interactions.css'

export function Home(){
 const navigationRef=useRef<HTMLElement>(null)
 const navigationTheme=useHomepageNavbarTheme(navigationRef)
 useHomepageReveals(navigationRef)
 const [searchParams,setSearchParams]=useSearchParams()
 const [open,setOpen]=useState(()=>searchParams.get('conversation')==='1'),[sent,setSent]=useState(false)
 useHomepageSmoothScroll(navigationRef,open)
 function changeEnquiryOpen(value:boolean){setOpen(value);if(!value&&searchParams.has('conversation')){const next=new URLSearchParams(searchParams);next.delete('conversation');setSearchParams(next,{replace:true})}}
 const mobileNavigation=useRef<HTMLDetailsElement>(null)
 useEffect(()=>{
  const dismiss=(event:PointerEvent)=>{const menu=mobileNavigation.current;if(menu?.open&&!menu.contains(event.target as Node)&&!(event.target as Element).closest('[data-signin-popup]'))menu.open=false}
  document.addEventListener('pointerdown',dismiss)
  return ()=>document.removeEventListener('pointerdown',dismiss)
 },[])
 function closeNavigation(){if(mobileNavigation.current)mobileNavigation.current.open=false}

 const [values,setValues]=useState({name:'',email:'',need:''})
 const [errors,setErrors]=useState<Record<string,string>>({})
 const nameRef=useRef<HTMLInputElement>(null),emailRef=useRef<HTMLInputElement>(null),needRef=useRef<HTMLTextAreaElement>(null)
 function submit(e:React.FormEvent){e.preventDefault();const next:Record<string,string>={};if(!values.name.trim())next.name='Enter your name.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))next.email='Enter a valid work email.';if(!values.need.trim())next.need='Describe your leadership need.';setErrors(next);if(Object.keys(next).length){(next.name?nameRef:next.email?emailRef:needRef).current?.focus();return}setSent(true)}
 function request(){setSent(false);setErrors({});setOpen(true)}
 return <div className="marketing marketing-v2 mandate-home"><a className="skip-link" href="#main">Skip to content</a><aside className="homepage-announcement" aria-label="Project announcement"><span>FutureProofing prototype challenge</span><Link to="/prototype-notes">Back to project hub</Link></aside><header ref={navigationRef} className="site-header" data-nav-theme={navigationTheme}><Link to="/" aria-label="Mandate homepage"><img src="/brand/mandate.svg" alt="Mandate" width="141" height="26"/></Link><nav aria-label="Main navigation"><a href="#challenges">Challenges</a><a href="#product-value">Workspace</a><a href="#our-process">Approach</a><a href="#technology-judgment">Technology</a><a href="#sample-workspace">Demo</a><a href="#faq">FAQ</a></nav><div className="marketing-header-actions"><SignInPreview/><Button className="marketing-header-cta homepage-primary-cta" variant="outline" onClick={request}>Request a conversation</Button></div><details ref={mobileNavigation} className="marketing-mobile-navigation" onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();closeNavigation();mobileNavigation.current?.querySelector('summary')?.focus()}}}><summary aria-label="Toggle navigation"><RiMenuLine className="menu-open-icon" aria-hidden="true"/><RiCloseLine className="menu-close-icon" aria-hidden="true"/></summary><div className="marketing-mobile-navigation-panel"><nav aria-label="Mobile main navigation"><a href="#challenges" onClick={closeNavigation}>Challenges</a><a href="#product-value" onClick={closeNavigation}>Workspace</a><a href="#our-process" onClick={closeNavigation}>Approach</a><a href="#technology-judgment" onClick={closeNavigation}>Technology</a><a href="#sample-workspace" onClick={closeNavigation}>Demo</a><a href="#faq" onClick={closeNavigation}>FAQ</a></nav><div className="marketing-mobile-actions"><Button onClick={()=>{closeNavigation();request()}}>Request a conversation</Button><SignInPreview/></div></div></details></header>
 <main id="main"><section className="mandate-hero" data-nav-theme="dark" aria-labelledby="homepage-hero-title"><MarketingHeroVideo/><div className="mandate-hero-content"><h1 id="homepage-hero-title"><span>The right leadership</span>{' '}<span>for what comes next.</span></h1><p>Executive search advice supported by a connected workspace.</p><div className="mandate-hero-actions"><Button className="homepage-primary-cta" size="lg" onClick={request}>Request a conversation</Button><a href="#sample-workspace">Explore sample workspace<RiArrowRightLine aria-hidden="true"/></a></div></div></section>


 <LeadershipChallenges onRequestConversation={request}/>
 <ProductValue/>
 <OurApproach onRequestConversation={request}/>
 <TechnologyJudgment/>
 <InteractiveDemo/>
 <Faq onRequestConversation={request}/>


 <FinalConversation onRequestConversation={request}/></main>
 <footer className="site-footer homepage-footer" data-nav-theme="dark"><div className="homepage-container"><div className="homepage-footer-main"><Link to="/" aria-label="Mandate homepage"><img src="/brand/mandate.svg" alt="Mandate" width="141" height="26"/></Link><nav aria-label="Footer navigation"><a href="#challenges">Challenges</a><a href="#product-value">Workspace</a><a href="#our-process">Approach</a><a href="#technology-judgment">Technology</a><a href="#sample-workspace">Demo</a><a href="#faq">FAQ</a><button type="button" onClick={request}>Request a conversation</button></nav></div><div className="homepage-footer-meta"><p>Mandate is a fictional prototype designed by Marcelo Ambiel.</p><div><Link to="/prototype-notes">Prototype notes</Link><Link to="/process">Design process</Link></div></div></div></footer>
 <Dialog open={open} onOpenChange={changeEnquiryOpen}><DialogContent className="enquiry-dialog"><DialogHeader><DialogTitle>{sent?'Contact preview only':'Request a conversation'}</DialogTitle><DialogDescription>{sent?'No inquiry was sent or saved. This prototype has no live contact service.':'Prototype contact form. Use sample information only; nothing will be sent or saved.'}</DialogDescription></DialogHeader>{sent?<><p className="homepage-contact-preview">This is a preview of the contact experience. A live inquiry destination is not configured.</p><DialogFooter><Button onClick={()=>changeEnquiryOpen(false)}>Close</Button></DialogFooter></>:<form onSubmit={submit} noValidate><div className="field"><label htmlFor="enquiry-name">Name</label><Input ref={nameRef} id="enquiry-name" autoComplete="name" value={values.name} onChange={e=>setValues({...values,name:e.target.value})} aria-invalid={!!errors.name} aria-describedby={errors.name?'error-name':undefined}/>{errors.name&&<p id="error-name" className="field-error">{errors.name}</p>}</div><div className="field"><label htmlFor="enquiry-email">Work email</label><Input ref={emailRef} type="email" id="enquiry-email" autoComplete="email" value={values.email} onChange={e=>setValues({...values,email:e.target.value})} aria-invalid={!!errors.email} aria-describedby={errors.email?'error-email':undefined}/>{errors.email&&<p id="error-email" className="field-error">{errors.email}</p>}</div><div className="field"><label htmlFor="enquiry-need">Leadership need</label><Textarea ref={needRef} id="enquiry-need" value={values.need} onChange={e=>setValues({...values,need:e.target.value})} aria-invalid={!!errors.need} aria-describedby={errors.need?'error-need':undefined}/>{errors.need&&<p id="error-need" className="field-error">{errors.need}</p>}</div>{Object.keys(errors).length>0&&<p role="alert" className="field-error">Check the highlighted fields.</p>}<DialogFooter><Button variant="outline" type="button" onClick={()=>changeEnquiryOpen(false)}>Cancel</Button><Button type="submit">Preview contact request</Button></DialogFooter></form>}</DialogContent></Dialog>
 </div>
}
