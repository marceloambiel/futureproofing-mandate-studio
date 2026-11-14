import {useEffect,useRef,useState} from 'react'

const clips=[
 {src:'/videos/leadership-office.mp4',poster:'/videos/leadership-office.jpg'},
 {src:'/videos/leadership-conversation.mp4',poster:'/videos/leadership-conversation.jpg'},
]

/** Decorative, muted playlist with a static reduced-motion state. */
export function MarketingHeroVideo(){
 const videos=useRef<(HTMLVideoElement|null)[]>([])
 const [active,setActive]=useState(0)
 const [playing,setPlaying]=useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
 const [failed,setFailed]=useState<number[]>([])
 useEffect(()=>{
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)')
  const update=()=>{if(preference.matches)setPlaying(false)}
  preference.addEventListener('change',update)
  return ()=>preference.removeEventListener('change',update)
 },[])
 useEffect(()=>{
  const elements=[...videos.current]
  const sync=()=>{
   for(const [index,video] of elements.entries()){
    if(!video)continue
    if(index===active&&playing&&!document.hidden)void video.play().catch(()=>setPlaying(false))
    else video.pause()
   }
  }
  sync()
  document.addEventListener('visibilitychange',sync)
  return ()=>{document.removeEventListener('visibilitychange',sync);for(const video of elements)video?.pause()}
 },[active,playing])
 function next(index:number){
  if(!playing)return
  const nextIndex=(index+1)%clips.length
  const target=failed.includes(nextIndex)?index:nextIndex
  const video=videos.current[target]
  if(video)video.currentTime=0
  if(target===index){void video?.play().catch(()=>setPlaying(false))}
  else setActive(target)
 }
 function unavailable(index:number){
  const failures=[...new Set([...failed,index])]
  setFailed(failures)
  const alternative=clips.findIndex((_,candidate)=>!failures.includes(candidate))
  if(alternative<0)setPlaying(false)
  else setActive(alternative)
 }
 return <>
  <div className="marketing-hero-media" aria-hidden="true">
   <img className="marketing-hero-poster" src={clips[0].poster} alt="" fetchPriority="high"/>
   {clips.map((clip,index)=><video key={clip.src} ref={element=>{videos.current[index]=element}} className={active===index?'is-active':undefined} src={clip.src} poster={clip.poster} muted playsInline preload={playing?'auto':'none'} tabIndex={-1} onEnded={()=>next(index)} onError={()=>unavailable(index)}/>)}
   <div className="marketing-hero-shade"/>
  </div>
 </>
}
