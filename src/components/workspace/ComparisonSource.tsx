import { useId, useRef, useState } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'
import { getComparisonSource, type ComparisonCriterion } from '@/domain/comparison-sources'
import type { Candidate } from '@/domain/model'

const criteria={integration:'Acquisition integration',scale:'Multi-site operations',availability:'Start date',location:'Location'}
export function ComparisonSource({candidate,criterion,onOpen}:{candidate:Candidate;criterion:ComparisonCriterion;onOpen:()=>void}) {
  const source=getComparisonSource(candidate,criterion)
  const [open,setOpen]=useState(false)
  const tooltipId=useId()
  const returningFromProfile=useRef(false)
  return <Tooltip.Root open={open} onOpenChange={(next,details)=>{if(next&&details.reason==='trigger-focus'&&returningFromProfile.current){returningFromProfile.current=false;return}setOpen(next)}}><Tooltip.Trigger className="comparison-source-tag" delay={200} onClick={()=>{returningFromProfile.current=true;setOpen(false);onOpen()}} aria-describedby={open?tooltipId:undefined} aria-label={`Source: ${candidate.name}, ${criteria[criterion]}`}>Source</Tooltip.Trigger><Tooltip.Portal><Tooltip.Positioner side="top" align="start" sideOffset={8} collisionPadding={16} className="comparison-source-positioner"><Tooltip.Popup id={tooltipId} role="tooltip" className="comparison-source-tooltip"><span>{source.label}</span><p>“{source.quote}”</p>{source.note&&<p className="comparison-source-note">{source.note}</p>}</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal></Tooltip.Root>
}
