import { useMobileLayout } from '@/hooks/use-mobile-layout'
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { sampleAssignment } from '@/domain/v2'
import {useAssignmentSubmitted} from '@/hooks/use-assignment-submitted'
import './executive-dashboard.css'

const assignments = [
  {status:'available',title:sampleAssignment.title,summary:'Find an operations leader to integrate two acquisitions.',to:'/workspace/assignment'},
  {status:'waiting',title:'Harborview CFO Search',summary:'Appoint a CFO to lead the next phase of growth.',reason:'Waiting for the client’s role brief.'},
  {status:'waiting',title:'Alderstone Commercial Leadership',summary:'Find a commercial leader to drive revenue growth.',reason:'Waiting for scope and compensation details.'},
] as const
const sectors = [
  {name:'Technology',value:48,color:'var(--chart-gold)',fill:'var(--chart-gold-fill)'},
  {name:'Healthcare',value:24,color:'var(--chart-sage)',fill:'var(--chart-sage-fill)'},
  {name:'Industrials',value:32,color:'var(--chart-apricot)',fill:'var(--chart-apricot-fill)'},
  {name:'Consumer',value:18,color:'var(--chart-lilac)',fill:'var(--chart-lilac-fill)'},
  {name:'Financial services',value:6,color:'var(--chart-rose)',fill:'var(--chart-rose-fill)'},
]
const placements = [
  {month:'January',fees:225,x:60,y:110},
  {month:'February',fees:233,x:129,y:97.2},
  {month:'March',fees:250,x:198,y:70},
  {month:'April',fees:254,x:267,y:63.6},
  {month:'May',fees:250,x:336,y:70},
]
const readinessColors=[{stroke:'var(--chart-apricot)',fill:'var(--chart-apricot-fill)'},{stroke:'var(--chart-gold)',fill:'var(--chart-gold-fill)'},{stroke:'var(--chart-sage)',fill:'var(--chart-sage-fill)'},{stroke:'var(--chart-pending)',fill:'var(--chart-pending-fill)'}]
const readinessStatuses=['Needs attention','In review','Ready','Pending']

function CardHeading({title,subtitle}:{title:string;subtitle?:string}) {
  return <div className="bento-heading"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div></div>
}

export function ExecutiveDashboard() {
  const mobile=useMobileLayout()
  const submitted=useAssignmentSubmitted()
  const currentAssignments=assignments.filter(assignment=>!submitted||assignment.status!=='available')
  const assignmentList=useRef<HTMLDivElement>(null)
  useLayoutEffect(()=>{
    const list=assignmentList.current
    if(!list)return
    const rows=Array.from(list.querySelectorAll<HTMLElement>('.bento-task-content'))
    const update=()=>{
      for(const row of rows){
        const title=row.querySelector<HTMLElement>('h3')
        const action=row.querySelector<HTMLElement>('.bento-action-primary,.bento-action-disabled')
        if(!title||!action)continue
        const required=parseFloat(getComputedStyle(title).fontSize)*2+action.getBoundingClientRect().width+24
        const stacked=required>row.getBoundingClientRect().width
        if(row.classList.contains('bento-task-stacked')!==stacked)row.classList.toggle('bento-task-stacked',stacked)
      }
    }
    const observer=new ResizeObserver(update)
    for(const row of rows){observer.observe(row);for(const child of row.querySelectorAll('h3,.bento-action-primary,.bento-action-disabled'))observer.observe(child)}
    const textObserver=new MutationObserver(update)
    textObserver.observe(list,{subtree:true,attributes:true,attributeFilter:['style']})
    update()
    return ()=>{observer.disconnect();textObserver.disconnect()}
  },[submitted])

  const carousel=useRef<HTMLDivElement>(null)
  const [activeChart,setActiveChart]=useState(0)
  useLayoutEffect(()=>{
    const track=carousel.current
    if(!mobile||!track)return
    const cards=Array.from(track.children) as HTMLElement[]
    const update=()=>{
      track.style.removeProperty('--chart-accessible-height')
      let required=0
      for(const card of cards){
        const heading=card.querySelector('h2')
        const scale=heading?Math.max(1,parseFloat(getComputedStyle(heading).fontSize)/16):1
        const naturalHeight=card.getBoundingClientRect().width*1.2944
        if(scale>1)required=Math.max(required,naturalHeight*scale)
        if(card.scrollHeight>card.clientHeight+1)required=Math.max(required,card.scrollHeight+20)
      }
      if(required)track.style.setProperty('--chart-accessible-height',`${Math.ceil(required)}px`)
    }
    const observer=new ResizeObserver(update)
    for(const card of cards)for(const content of card.querySelectorAll('.bento-heading,ul,.pipeline-legend,.readiness-chart,.readiness-legend'))observer.observe(content)
    const textObserver=new MutationObserver(records=>{if(records.some(record=>record.target!==track))update()})
    textObserver.observe(track,{subtree:true,attributes:true,attributeFilter:['style','class']})
    update()
    return ()=>{observer.disconnect();textObserver.disconnect()}
  },[mobile])
  function updateActiveChart() {
    const track=carousel.current
    if(!track)return
    const cards=Array.from(track.children) as HTMLElement[]
    const first=cards[0]?.offsetLeft??0
    const distances=cards.map(card=>Math.abs(card.offsetLeft-first-track.scrollLeft))
    setActiveChart(distances.indexOf(Math.min(...distances)))
  }
  function goToChart(index:number) {
    const track=carousel.current
    if(!track)return
    const cards=Array.from(track.children) as HTMLElement[]
    track.scrollTo({left:cards[index].offsetLeft-cards[0].offsetLeft,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})
  }
  const placementChart=useRef<SVGSVGElement>(null)
  const [placementSize,setPlacementSize]=useState({width:340,height:125})
  const placementHeight=placementSize.height
  const plotX=(x:number)=>60+(x-60)/276*(placementSize.width-64)
  useLayoutEffect(()=>{
    const chart=placementChart.current
    if(!chart)return
    const observer=new ResizeObserver(()=>{
      const {width,height}=chart.getBoundingClientRect()
      if(width>0)setPlacementSize({width,height:Math.max(50,height)})
    })
    observer.observe(chart)
    return ()=>observer.disconnect()
  },[mobile])
  const plotY=(fees:number)=>8+(275-fees)/50*(placementHeight-36)
  const placementLine=`M60 ${plotY(225)} C${plotX(94)} ${plotY(225)} ${plotX(105)} ${plotY(229)} ${plotX(129)} ${plotY(233)} S${plotX(174)} ${plotY(250)} ${plotX(198)} ${plotY(250)} S${plotX(243)} ${plotY(256)} ${plotX(267)} ${plotY(254)} S${plotX(312)} ${plotY(251.25)} ${plotX(336)} ${plotY(250)}`
  const tooltipId=useId()
  const [tooltip,setTooltip]=useState<{label:string;x:number;y:number}|null>(null)
  function showTooltip(label:string,x:number,y:number) {
    setTooltip({label,x:Math.max(8,Math.min(x+12,window.innerWidth-232)),y:Math.max(8,Math.min(y+14,window.innerHeight-74))})
  }
  function hoverProps(label:string) {
    return {
      tabIndex:0,
      role:'img',
      'aria-label':label,
      'aria-describedby':tooltip?.label===label?tooltipId:undefined,
      onPointerEnter:(event:PointerEvent<Element>)=>showTooltip(label,event.clientX,event.clientY),
      onPointerMove:(event:PointerEvent<Element>)=>showTooltip(label,event.clientX,event.clientY),
      onPointerLeave:()=>setTooltip(null),
      onFocus:(event:FocusEvent<Element>)=>{const rect=event.currentTarget.getBoundingClientRect();showTooltip(label,rect.left,rect.bottom)},
      onBlur:()=>setTooltip(null),
      onKeyDown:(event:{key:string})=>{if(event.key==='Escape')setTooltip(null)},
    }
  }
  const charts=<>
    <section className="bento-card bento-value">
      <CardHeading title="Placement value" subtitle="Fees from completed executive searches"/>
      <div className="bento-value-summary"><p className="bento-metric">$250K</p><p className="bento-trend"><strong>+10%</strong> year to date</p></div>
      <svg ref={placementChart} className="placement-chart" viewBox={`0 0 ${placementSize.width} ${placementHeight}`} role="group" aria-label="Placement fees by month">

        {[275,250,225].map(fees=><g key={fees}><line x1="60" x2={placementSize.width} y1={plotY(fees)} y2={plotY(fees)} stroke="var(--border)"/><text x="0" y={plotY(fees)+4} textAnchor="start">${fees}K</text></g>)}
        <path d={`${placementLine} L${plotX(336)} ${plotY(225)} L60 ${plotY(225)}Z`} fill="var(--chart-sage-fill)"/>
        <path d={placementLine} fill="none" stroke="var(--bento-green)" strokeWidth="1" strokeLinecap="round"/>
        {placements.map((point,index)=><g className="placement-hit" key={point.month} {...hoverProps(`${point.month} · $${point.fees}K placement fees`)}><circle cx={plotX(point.x)} cy={plotY(point.fees)} r="4" fill="var(--bento-green)" stroke="var(--card)" strokeWidth="2"/><rect x={index===0?60:plotX(point.x-34.5)} y="0" width={(placementSize.width-64)/4*(index===0||index===4?.5:1)} height={placementHeight-20} fill="transparent"/></g>)}
        <text x="60" y={placementHeight-4}>Jan</text><text x={plotX(198)} y={placementHeight-4}>Mar</text><text x={plotX(336)} y={placementHeight-4} textAnchor="end">May</text>
      </svg>
    </section>
    <section className="bento-card bento-sectors">
      <CardHeading title="Candidates by sector" subtitle="Talent across your search network"/>
      <div className="sector-chart"><svg viewBox="0 0 210 210" role="group" aria-label="Candidates by sector, 128 total">
        <g transform="translate(105 105) scale(0.75) translate(-105 -105)">

        {sectors.map((sector,index)=>{const length=sector.value/128*100;const start=sectors.slice(0,index).reduce((sum,item)=>sum+item.value,0)/128*100;return <g key={sector.name}><circle cx="105" cy="105" r="85" pathLength="100" fill="none" stroke={sector.color} strokeWidth="14" strokeDasharray={`${length} ${100-length}`} strokeDashoffset={-start} transform="rotate(-90 105 105)" aria-hidden="true"/><circle className="chart-segment" {...hoverProps(`${sector.name} · ${sector.value} candidates (${length.toFixed(1)}%)`)} cx="105" cy="105" r="85" pathLength="100" fill="none" stroke={sector.fill} strokeWidth="11.5" strokeDasharray={`${length} ${100-length}`} strokeDashoffset={-start} transform="rotate(-90 105 105)"/></g>})}
        {sectors.map((sector,index)=>{
          const end=sectors.slice(0,index+1).reduce((sum,item)=>sum+item.value,0)/128*Math.PI*2-Math.PI/2
          return <line key={`divider-${sector.name}`} x1={105+Math.cos(end)*78} y1={105+Math.sin(end)*78} x2={105+Math.cos(end)*92} y2={105+Math.sin(end)*92} stroke={sector.color} strokeWidth="1.25" aria-hidden="true"/>
        })}
        </g>
        <text x="105" y="104" textAnchor="middle" className="donut-number">128</text><text x="105" y="128" textAnchor="middle" className="donut-label">Candidates</text>
      </svg><ul>{sectors.map(sector=><li key={sector.name}><span className="sector-dot" style={{background:sector.fill,borderColor:sector.color}}/><span>{sector.name}</span><strong>{sector.value}</strong></li>)}</ul></div>
    </section>
    <section className="bento-card bento-pipeline">
      <CardHeading title="Search pipeline" subtitle="Progress across this quarter’s searches"/>
      <svg className="pipeline-chart" viewBox="0 10 300 160" role="group" aria-label="18 searches this quarter, 12 completed and 6 in progress."><defs><linearGradient id="pipeline-gradient" x1="0" y1="0" x2="1" y2="0"><stop stopColor="var(--chart-gradient-start)"/><stop offset="55%" stopColor="var(--chart-gradient-mid)"/><stop offset="100%" stopColor="var(--chart-gradient-end)"/></linearGradient></defs><path className="chart-segment" {...hoverProps('In progress · 6 searches (33.3%)')} d="M35 140 A115 115 0 0 1 265 140" fill="none" stroke="var(--chart-pending-fill)" strokeWidth="11.5" strokeLinecap="round"/><path d="M35 140 A115 115 0 0 1 207.5 40.4" fill="none" stroke="var(--chart-gold)" strokeWidth="14" strokeLinecap="round" aria-hidden="true"/><path className="chart-segment" {...hoverProps('Completed · 12 searches (66.7%)')} d="M35 140 A115 115 0 0 1 207.5 40.4" fill="none" stroke="url(#pipeline-gradient)" strokeWidth="11.5" strokeLinecap="round"/><text x="150" y="119" textAnchor="middle" className="pipeline-number">18</text><text x="150" y="145" textAnchor="middle">Executive searches</text></svg>
      <div className="pipeline-legend"><span><i style={{background:'var(--chart-gold-fill)',borderColor:'var(--chart-gold)'}}/>Completed <strong>12</strong></span><span><i style={{background:'var(--chart-pending-fill)',borderColor:'var(--chart-pending)'}}/>In progress <strong>6</strong></span></div>
    </section>
    <section className="bento-card bento-readiness">
      <CardHeading title="Search readiness" subtitle="Summary across active mandates"/>
      <div className="readiness-chart">{[{name:'Brief alignment',values:[10,15,60,15]},{name:'Shortlist quality',values:[5,20,65,10]},{name:'Availability',values:[10,30,45,15]}].map(row=><div className="readiness-row" key={row.name}><span>{row.name}</span><div className="readiness-bar" role="group" aria-label={`${row.name}: ${row.values[0]}% needs attention, ${row.values[1]}% in review, ${row.values[2]}% ready, ${row.values[3]}% pending`}>{row.values.map((value,i)=><i className="chart-segment" {...hoverProps(`${row.name} · ${readinessStatuses[i]}: ${value}%`)} key={i} style={{flex:value,background:readinessColors[i].fill,'--segment-stroke':readinessColors[i].stroke} as CSSProperties}/>)}</div></div>)}</div>
      <div className="readiness-legend">{['Attention','In review','Ready','Pending'].map((label,index)=><span key={label}><i style={{background:readinessColors[index].fill,borderColor:readinessColors[index].stroke}}/>{label}</span>)}</div>
    </section>
  </>
  return <div className="executive-dashboard">
    <section className="bento-actions">
      <CardHeading title="Current Assignments" subtitle="Your active and upcoming searches"/>
      <div ref={assignmentList} className="bento-task-list" style={{gridTemplateRows:`repeat(${currentAssignments.length},minmax(128px,max-content))`}}>
        {currentAssignments.map(assignment=>{
          const available=assignment.status==='available'
          const description=assignment.status==='waiting'?assignment.reason:'Client brief updated'
          const content=<><div className="bento-task-meta">{available&&<span className="notification-new-tag action-new-tag">NEW</span>}<span className="bento-assignment-description" title={description}>{description}</span></div><div className="bento-task-content"><div className="bento-task-body"><h3 title={assignment.title}>{assignment.title}</h3>{available?<span className="bento-action-primary">Review brief</span>:<button type="button" className="bento-action bento-action-disabled" disabled>Blocked</button>}</div><p className="bento-assignment-summary" title={assignment.summary}>{assignment.summary}</p></div></>
          return assignment.status==='available'?<Link className="bento-task" key={assignment.title} to={assignment.to}>{content}</Link>:<article className="bento-task bento-task-waiting" key={assignment.title}>{content}</article>
        })}
      </div>
      {submitted&&<section className="bento-submitted-assignment" role="status" aria-label="Assignment sent for review"><h2>Sent for review</h2><h3>{sampleAssignment.title}</h3><p>The discussion brief has been sent. Waiting for manager review.</p></section>}
      <p className="bento-day-complete">That’s all for today :)</p>
    </section>
    {mobile?<section className="mobile-dashboard-overview" aria-labelledby="mobile-overview-title"><h2 id="mobile-overview-title">Overview</h2><div ref={carousel} className="mobile-chart-carousel" role="region" aria-label="Overview charts" tabIndex={0} onScroll={updateActiveChart}>{charts}</div><div className="chart-pagination" role="group" aria-label="Chart pagination">{['Placement value','Candidates by sector','Search pipeline','Search readiness'].map((title,index)=><button key={title} type="button" aria-label={`Show ${title} chart`} aria-current={activeChart===index?'true':undefined} onClick={()=>goToChart(index)}><span aria-hidden="true"/></button>)}</div></section>:charts}
    {tooltip&&<div className="chart-tooltip" role="tooltip" id={tooltipId} style={{left:tooltip.x,top:tooltip.y}}>{tooltip.label}</div>}
  </div>
}
