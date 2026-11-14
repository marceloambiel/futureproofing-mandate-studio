import { useState } from 'react'
import { RiRestartLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useWorkspaceV2 } from '@/state/WorkspaceV2Provider'
import { useWorkspace } from '@/state/WorkspaceProvider'

export function ResetSample({label,className,demo=false,onReset}:{label?:string;className?:string;demo?:boolean;onReset?:()=>void}) {
  const triggerLabel=label??(demo?'Reset demo':'Reset sample workspace')
  const { session, error } = useWorkspace()
  const preferences=useWorkspaceV2()
  const [open, setOpen] = useState(false)
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger title={demo?triggerLabel:undefined} aria-label={triggerLabel} render={demo?<button type="button" className={className}/>:<Button variant="outline" className={className}/>}>{demo&&<RiRestartLine aria-hidden="true"/>}<span className={demo?'rail-reset-label':undefined}>{triggerLabel}</span></DialogTrigger>
    <DialogContent confirmation className="workspace-dialog">
      <DialogHeader><DialogTitle>{demo?'Reset demo?':'Reset sample workspace?'}</DialogTitle><DialogDescription>{demo?'This clears saved edits and unsaved changes, restores all candidates, and resets notifications.':'This replaces this workspace’s saved sample and unsaved changes with the starting assignment. Other browser data is unchanged.'}</DialogDescription></DialogHeader>
      {error === 'unavailable' && <div role="alert" className="workspace-error-message"><p>We couldn’t reset the saved sample. Browser saving is unavailable. Your existing copy is unchanged.</p><Button variant="outline" onClick={() => {session.continueInMemory();setOpen(false)}}>Continue without saving</Button></div>}
      <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { if (session.reset()) {preferences.reset();setOpen(false);onReset?.()} }}>{demo?'Reset demo':'Reset sample'}</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}

export function RecoveryNotice() {
  const { recovery, persistence, conflict, session } = useWorkspace()
  if (conflict) return <section className="workspace-recovery workspace-notice" role="alert"><strong>A newer version was saved in another tab.</strong><p>Your edits are still here. Reload the saved version to discard this copy, or keep your edits and save them as a new draft after the latest version.</p><div className="workspace-actions"><Button variant="outline" onClick={session.reloadExternal}>Reload saved version</Button><Button onClick={session.keepWorking}>Keep my edits as a new draft</Button></div></section>
  if (recovery === 'corrupt' || recovery === 'unsupported') return <section className="workspace-recovery workspace-notice" role="alert"><strong>We couldn’t open the saved sample workspace.</strong><p>{recovery === 'unsupported' ? 'This saved copy uses a version this prototype cannot open.' : 'The saved copy is incomplete or unreadable.'} Your saved copy has not been replaced. Recover the starting sample, or continue in this session without replacing it.</p><div className="workspace-actions"><ResetSample label="Recover sample workspace" /><Button variant="outline" onClick={session.continueInMemory}>Continue without saving</Button></div></section>
  if (recovery === 'unavailable' || persistence === 'memory') return <section className="workspace-recovery workspace-notice" role="status"><strong>Changes are kept in this session only.</strong><p>Browser saving is unavailable. You can continue working, but refreshing or closing this page may lose your changes.</p>{recovery === 'unavailable' && <Button variant="outline" onClick={session.continueInMemory}>Continue without saving</Button>}</section>
  return null
}
