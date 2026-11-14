import { useState } from 'react'
import { RiArrowDownSLine } from '@remixicon/react'
import { clientBriefDocuments } from '@/domain/v2'
import { sourceDetailValues, type DetailSection } from '@/domain/assignment-details'
import { FieldHistory } from '@/components/workspace/FieldHistory'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useWorkspaceV2 } from '@/state/WorkspaceV2Provider'

const timestamp=new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short'})
export function AssignmentDetails({mobileOptimized=false}:{mobileOptimized?:boolean}) {
  const sections=[['search',mobileOptimized?'Search brief':'Search'],['role','Role'],['company','Company']] as const
  const [current,previous]=clientBriefDocuments
  const {assignmentDetails,saveAssignmentDetails}=useWorkspaceV2()
  const [editing,setEditing]=useState<DetailSection|null>(null)
  const [draft,setDraft]=useState<Record<string,string>>({})
  const [restoring,setRestoring]=useState(false)
  const [history,setHistory]=useState(false)
  const title=sections.find(([id])=>id===editing)?.[1]
  function edit(section:DetailSection){setDraft({...assignmentDetails?.sections[section]?.[0].values??sourceDetailValues(section)});setRestoring(false);setEditing(section)}
  function save(){if(editing&&saveAssignmentDetails(editing,draft,restoring?'restore':'edit'))setEditing(null)}
  return <aside className="workspace-preparation assignment-extracted-details" aria-label="Details extracted from the client brief">
    <h2 className="brief-breakdown-title">Brief breakdown <span className="brief-breakdown-ai-tag">AI generated</span></h2>
    {sections.map(([id,label])=>{
      const editButton=<button type="button" className="assignment-detail-tertiary" aria-label={`Edit ${label.toLowerCase()}`} onClick={()=>edit(id)}>Edit</button>
      const facts=<dl className="assignment-extracted-facts">{current.facts[id].map(fact=>{
        const value=assignmentDetails?.sections[id]?.[0].values[fact.id]??fact.value
        const changed=previous.facts[id].find(item=>item.id===fact.id)?.value!==fact.value
        return <div key={fact.id}><dt>{fact.label}{value!==fact.value?<span className="assignment-detail-edited">Edited</span>:changed&&<FieldHistory label={fact.label} valueFor={document=>document.facts[id].find(item=>item.id===fact.id)?.value}/>}</dt><dd>{value}</dd></div>
      })}</dl>
      return mobileOptimized?<details key={id} className="mobile-assignment-section" open={id==='search'}><summary><h2>{label}</h2>{id==='search'&&<span className="notification-new-tag mobile-search-collapsed-new">NEW</span>}<RiArrowDownSLine aria-hidden="true"/></summary>{editButton}{facts}</details>:<section key={id} className="assignment-extracted-section"><div className="assignment-editable-heading"><h2>{label}</h2>{editButton}</div>{facts}</section>
    })}
    <Dialog open={editing!==null} onOpenChange={open=>{if(!open){setEditing(null);setHistory(false)}}}><DialogContent className="workspace-dialog assignment-detail-dialog"><DialogHeader><DialogTitle>Edit {title?.toLowerCase()}</DialogTitle><DialogDescription>Saving edits or restoring a version requires a fresh review. The assignment returns to Overview; existing candidates and briefs remain saved.</DialogDescription></DialogHeader>
      <form onSubmit={event=>{event.preventDefault();save()}}><div className="assignment-detail-fields">{editing&&current.facts[editing].map(fact=><label key={fact.id}>{fact.label}<textarea required maxLength={2000} rows={fact.value.length>80?3:2} value={draft[fact.id]??''} onChange={event=>setDraft({...draft,[fact.id]:event.target.value})}/></label>)}</div>
      {restoring&&<p className="workspace-warning" role="status">Restored values are staged for review. Confirm them to require a fresh review.</p>}
      <div className="assignment-detail-restore"><button type="button" className="assignment-detail-tertiary" onClick={()=>{if(editing){setDraft(sourceDetailValues(editing));setRestoring(true)}}}>Restore source details</button>{editing&&assignmentDetails?.sections[editing]&&<button type="button" className="assignment-detail-tertiary" onClick={()=>setHistory(true)}>View history</button>}</div>
      <div className="assignment-detail-actions"><Button variant="outline" onClick={()=>setEditing(null)} type="button">Cancel</Button><Button type="submit" disabled={Object.values(draft).some(value=>!value.trim())}>{restoring?'Restore and require review':'Save and require review'}</Button></div></form>
    </DialogContent></Dialog>
    <Dialog open={history} onOpenChange={setHistory}><DialogContent className="workspace-dialog assignment-detail-dialog"><DialogHeader><DialogTitle>{title} history</DialogTitle><DialogDescription>Restoring any version requires a fresh review before continuing.</DialogDescription></DialogHeader><div className="assignment-detail-history">{editing&&assignmentDetails?.sections[editing]?.map((version,index)=><section key={`${version.at}-${index}`}><h3>{index===0?'Current':version.kind==='source'?'Source details':'Past version'} <time dateTime={version.at}>{timestamp.format(new Date(version.at))}</time></h3><dl>{current.facts[editing].map(fact=><div key={fact.id}><dt>{fact.label}</dt><dd>{version.values[fact.id]}</dd></div>)}</dl>{index>0&&<button type="button" className="assignment-detail-tertiary" onClick={()=>{setDraft({...version.values});setRestoring(true);setHistory(false)}}>Restore this version</button>}</section>)}</div></DialogContent></Dialog>
  </aside>
}
