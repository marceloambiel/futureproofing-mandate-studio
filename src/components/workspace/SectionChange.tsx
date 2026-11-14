import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function SectionChange({label,previous,current,previousVersion='V1',currentVersion='V2'}:{label:string;previous:string;current:string;previousVersion?:string;currentVersion?:string}) {
  const [open,setOpen]=useState(false)
  const trigger=useRef<HTMLButtonElement>(null)
  if(previous===current) return null
  return <><Button ref={trigger} className="change-tag" variant="outline" aria-label={`Updated · View ${label.toLowerCase()} changes`} onClick={()=>setOpen(true)}>Updated · View {label.toLowerCase()} changes</Button>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent className="workspace-dialog workspace-version-dialog" finalFocus={trigger}><DialogHeader><DialogTitle>{label} changes</DialogTitle><DialogDescription>Only this section is compared. Earlier approval remains attached to V1; it does not cover the current draft.</DialogDescription></DialogHeader><div className="workspace-version-pair"><section className="workspace-version-pane"><p className="workspace-eyebrow">{previousVersion} · {previousVersion==='V1'?'Earlier approved':'Previous saved version'}</p><h2>Previous {label.toLowerCase()}</h2><p className="workspace-summary">{previous||'Not included in this version.'}</p></section><section className="workspace-version-pane workspace-version-current"><p className="workspace-eyebrow">{currentVersion} · Current content</p><h2>Current {label.toLowerCase()}</h2><p className="workspace-summary">{current||'Not included in this version.'}</p></section></div></DialogContent></Dialog></>
}
